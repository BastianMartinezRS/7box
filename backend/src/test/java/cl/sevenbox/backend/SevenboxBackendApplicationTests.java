package cl.sevenbox.backend;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SevenboxBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String loginAndGetToken(String username, String password) throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "username", username,
                "password", password
        ));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    @Test
    void openApiDocsShouldBeAccessibleAndDocumentEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/peliculas']").exists())
                .andExpect(jsonPath("$.paths['/api/auth/login']").exists());
    }

    @Test
    void protectedEndpointsShouldRequireJwt() throws Exception {
        mockMvc.perform(get("/api/peliculas"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerShouldCreateRegularUserAndRejectReservedAdmin() throws Exception {
        String registerBody = objectMapper.writeValueAsString(java.util.Map.of(
                "username", "cinefilo_test",
                "password", "secreta123"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("cinefilo_test"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.esAdmin").value(false))
                .andExpect(jsonPath("$.token").isNotEmpty());

        String reservedBody = objectMapper.writeValueAsString(java.util.Map.of(
                "username", "admin",
                "password", "1234"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reservedBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void roleBasedCrudAndPerUserProfileShouldWork() throws Exception {
        String userToken = loginAndGetToken("usuario", "1234");
        String adminToken = loginAndGetToken("admin", "admin");

        // Verificar /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.esAdmin").value(true));

        // Usuario regular puede listar peliculas iniciales
        mockMvc.perform(get("/api/peliculas")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(23))));

        // Usuario regular NO puede crear peliculas (403)
        String nuevaPeliJson = """
                {
                  "titulo": "Inception Test",
                  "nota": 8.8,
                  "duracion": "148 min",
                  "director": "Christopher Nolan",
                  "generos": ["Ciencia Ficción", "Acción"],
                  "imagen": "https://example.com/poster.jpg",
                  "trailer": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                  "sinopsis": "Un ladrón que roba secretos mediante sueños."
                }
                """;

        mockMvc.perform(post("/api/peliculas")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevaPeliJson))
                .andExpect(status().isForbidden());

        // Admin SI puede crear película
        MvcResult createResult = mockMvc.perform(post("/api/peliculas")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevaPeliJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Inception Test"))
                .andReturn();

        long createdId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Admin puede actualizar película
        String updatePeliJson = """
                {
                  "titulo": "Inception Actualizada",
                  "nota": 9.0,
                  "duracion": "148 min",
                  "director": "Christopher Nolan",
                  "generos": ["Ciencia Ficción"],
                  "imagen": "https://example.com/poster2.jpg",
                  "trailer": "https://www.youtube.com/watch?v=YoHD9XEInc0",
                  "sinopsis": "Sinopsis actualizada."
                }
                """;

        mockMvc.perform(put("/api/peliculas/" + createdId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePeliJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Inception Actualizada"))
                .andExpect(jsonPath("$.nota").value(9.0));

        // Usuario regular puede marcar estado y puntuacion personal sin afectar al admin
        mockMvc.perform(put("/api/peliculas/" + createdId + "/perfil")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estadoPerfil\":\"vista\",\"miPuntuacion\":5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPerfil").value("vista"))
                .andExpect(jsonPath("$.miPuntuacion").value(5));

        mockMvc.perform(get("/api/peliculas/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPerfil").value("ninguno"))
                .andExpect(jsonPath("$.miPuntuacion").doesNotExist());

        // Usuario regular NO puede eliminar película (403)
        mockMvc.perform(delete("/api/peliculas/" + createdId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Admin SI puede eliminar película (204)
        mockMvc.perform(delete("/api/peliculas/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/peliculas/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void watchlistCommunityStatsAndReviewsCrudShouldWork() throws Exception {
        String userToken = loginAndGetToken("usuario", "1234");
        String adminToken = loginAndGetToken("admin", "admin");

        // Registrar otro usuario para probar permisos entre autores de reseñas
        MvcResult otherReg = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"otro_cinefilo\",\"password\":\"12345\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String otherToken = objectMapper.readTree(otherReg.getResponse().getContentAsString()).get("token").asText();

        // Obtener id de primera película
        MvcResult listRes = mockMvc.perform(get("/api/peliculas")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andReturn();
        long peliId = objectMapper.readTree(listRes.getResponse().getContentAsString()).get(0).get("id").asLong();

        // Probar estado por_ver y cálculo de promedio comunidad
        mockMvc.perform(put("/api/peliculas/" + peliId + "/perfil")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estadoPerfil\":\"por_ver\",\"miPuntuacion\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPerfil").value("por_ver"))
                .andExpect(jsonPath("$.promedioComunidad").value(4.0))
                .andExpect(jsonPath("$.totalVotosComunidad").value(1));

        // Crear reseña como usuario
        MvcResult resenaCreate = mockMvc.perform(post("/api/peliculas/" + peliId + "/resenas")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comentario\":\"Excelente película\",\"puntuacion\":5}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.comentario").value("Excelente película"))
                .andExpect(jsonPath("$.esMia").value(true))
                .andReturn();
        long resenaId = objectMapper.readTree(resenaCreate.getResponse().getContentAsString()).get("id").asLong();

        // Otro usuario NO puede editar ni eliminar reseña ajena (403)
        mockMvc.perform(put("/api/resenas/" + resenaId)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comentario\":\"Intento editar ajena\",\"puntuacion\":1}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/resenas/" + resenaId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());

        // El autor SI puede editar su reseña
        mockMvc.perform(put("/api/resenas/" + resenaId)
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comentario\":\"Editada por autor\",\"puntuacion\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comentario").value("Editada por autor"));

        // Admin SI puede moderar/eliminar cualquier reseña (204)
        mockMvc.perform(delete("/api/resenas/" + resenaId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void adminUserManagementShouldEnforceRoles() throws Exception {
        String userToken = loginAndGetToken("usuario", "1234");
        String adminToken = loginAndGetToken("admin", "admin");

        // Usuario regular no puede acceder a /api/admin/usuarios
        mockMvc.perform(get("/api/admin/usuarios")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Registrar usuario temporal para probar cambio de rol y eliminación
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"moderador_temp\",\"password\":\"1234\"}"))
                .andExpect(status().isCreated());

        MvcResult usersRes = mockMvc.perform(get("/api/admin/usuarios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode usersArr = objectMapper.readTree(usersRes.getResponse().getContentAsString());

        long tempId = -1;
        for (JsonNode u : usersArr) {
            if ("moderador_temp".equals(u.get("username").asText())) {
                tempId = u.get("id").asLong();
                break;
            }
        }

        // Cambiar rol a ROLE_ADMIN
        mockMvc.perform(put("/api/admin/usuarios/" + tempId + "/rol")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ROLE_ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.esAdmin").value(true));

        // Eliminar usuario temporal
        mockMvc.perform(delete("/api/admin/usuarios/" + tempId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void top4FavoritasAndChangePasswordShouldWork() throws Exception {
        MvcResult reg = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"fav_user\",\"password\":\"clave123\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        String token = objectMapper.readTree(reg.getResponse().getContentAsString()).get("token").asText();

        MvcResult listRes = mockMvc.perform(get("/api/peliculas")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode movies = objectMapper.readTree(listRes.getResponse().getContentAsString());

        // Marcar 4 películas como favoritas debe funcionar
        for (int i = 0; i < 4; i++) {
            long id = movies.get(i).get("id").asLong();
            mockMvc.perform(put("/api/peliculas/" + id + "/perfil")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"esFavorita\":true}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.esFavorita").value(true));
        }

        // La 5ta favorita debe ser rechazada (400)
        long fifthId = movies.get(4).get("id").asLong();
        mockMvc.perform(put("/api/peliculas/" + fifthId + "/perfil")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"esFavorita\":true}"))
                .andExpect(status().isBadRequest());

        // Cambio de contraseña
        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"clave123\",\"newPassword\":\"nuevaClave456\"}"))
                .andExpect(status().isOk());

        // Login con nueva contraseña
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"fav_user\",\"password\":\"nuevaClave456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }
}
