# 🎬 7box

> Aplicación web Full-Stack (Spring Boot + React) para explorar películas, ver tráilers embebidos, escribir reseñas de la comunidad y gestionar colecciones cinematográficas personales con autenticación JWT y control de acceso por roles.

---

## ✨ Características Principales

### Frontend (`React + Vite + Bootstrap 5`)
- **Catálogo Dinámico y Filtro por Género:** Carruseles horizontales responsivos (*Catálogo*, *Recomendadas Para Ti*, *Mejor Valoradas*), filtro dinámico por género y buscador en tiempo real por **título o director**.
- **Detalles, Tráiler Embebido y Reseñas:** Modal interactivo con sinopsis, ficha técnica, calificación IMDb, promedio de la comunidad 7box, reproductor embebido de YouTube (`embed`) y CRUD completo de reseñas escritas.
- **Colección Personal (`Mi Perfil`):**
  - Clasificación en *Vistas*, *Por ver (Watchlist)*, *Abandonadas* y *No me gustaron*.
  - **Top 4 Favoritas** fijables por usuario.
  - Estadísticas personales (vistas, por ver, tiempo total visto, promedio personal y género favorito).
  - Puntuación personal independiente de `1` a `5` estrellas.
- **Gestión de Sesión y Seguridad en Frontend:**
  - Persistencia mediante token **JWT** (`token_7box`) validado contra `GET /api/auth/me` al recargar la página.
  - Rutas protegidas (`ProtectedRoute`) y panel exclusivo `/admin` (`AdminPanel`) restringido a `ROLE_ADMIN`.
  - Cambio de contraseña desde la barra de navegación y notificaciones *toast* de confirmación.
  - Diseño adaptado para móviles (grilla de 2 columnas en perfil, controles táctiles y tablas responsivas).

### Backend (`Spring Boot 3.5 + JPA + Security + Swagger`)
- **Base de Datos Relacional (H2 persistente / JPA):** Entidades `Usuario`, `Pelicula`, `InteraccionUsuario` y `Resena` con carga inicial automática (`DataInitializer`).
- **API REST CRUD Documentada en Swagger:** Documentación interactiva con soporte `Bearer JWT` en `/swagger-ui.html`.
- **Seguridad JWT y Roles:** Contraseñas encriptadas con BCrypt, autenticación stateless con tokens JWT (`JwtAuthFilter`), autorización por roles (`ROLE_ADMIN`, `ROLE_USER`) y configuración CORS.
- **Panel Administrativo:** CRUD de películas del catálogo y gestión de usuarios/roles (`GET/PUT/DELETE /api/admin/usuarios`).

---

## 🛠️ Tecnologías

### Backend
- **Java 21** & **Spring Boot 3.5.7** (`spring-boot-starter-web`, `data-jpa`, `security`, `validation`)
- **H2 Database** (persistente en `./backend/data/sevenboxdb`)
- **JJWT (`0.12.6`)** para generación y verificación de tokens JWT
- **Springdoc OpenAPI (`2.8.8`)** para Swagger UI
- **JUnit 5 / MockMvc / Spring Security Test** para pruebas de integración
- **Docker & Docker Compose** (`backend/Dockerfile` y `compose.yaml`)

### Frontend
- **React 19** + **Vite 8** + **React Router DOM 7**
- **Bootstrap 5** & **Bootstrap Icons** + **CSS3 personalizado**
- **Jasmine + Karma (`ChromeHeadless`)** & **Oxlint**

---

## 🔑 Credenciales de Prueba

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin` | CRUD completo de películas, moderación de reseñas y gestión de usuarios (`/admin`) |
| **Usuario Regular** | `usuario` | `1234` | Exploración, listas personales, Top 4 favoritas, calificaciones, reseñas y cambio de clave |

> 💡 También puedes registrar usuarios nuevos (`ROLE_USER`) desde la pestaña **"Registrarse"** en `/login`.

---

## 🔗 Endpoints Principales de la API

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Inicia sesión y retorna token JWT + rol |
| `POST` | `/api/auth/register` | Público | Registra un usuario `ROLE_USER` y retorna JWT |
| `GET` | `/api/auth/me` | Autenticado | Valida el JWT y retorna datos del usuario |
| `PUT` | `/api/auth/password` | Autenticado | Cambia la contraseña del usuario conectado |
| `GET` | `/api/peliculas` | Autenticado | Lista películas con estado/nota/favorita del usuario |
| `GET` | `/api/peliculas/{id}` | Autenticado | Obtiene el detalle de una película |
| `POST` | `/api/peliculas` | `ROLE_ADMIN` | Crea una nueva película |
| `PUT` | `/api/peliculas/{id}` | `ROLE_ADMIN` | Actualiza una película existente |
| `DELETE` | `/api/peliculas/{id}` | `ROLE_ADMIN` | Elimina una película |
| `PUT` | `/api/peliculas/{id}/perfil` | Autenticado | Actualiza estado, puntuación (`1–5`) o Top 4 favorita |
| `GET/POST` | `/api/peliculas/{id}/resenas` | Autenticado | Lista o publica reseñas de la película |
| `PUT/DELETE` | `/api/resenas/{id}` | Autor / `ADMIN` | Edita (autor) o elimina (autor o `ADMIN`) una reseña |
| `GET/PUT/DELETE` | `/api/admin/usuarios/**` | `ROLE_ADMIN` | Lista usuarios, cambia roles o elimina cuentas |

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/BastianMartinezRS/7box.git
cd 7box
```

### 2. Iniciar el Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
- API disponible en `http://localhost:8080/api`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`

### 3. Iniciar el Frontend (Terminal 2)
```bash
npm install
npm run dev
```
- Aplicación disponible en `http://localhost:5173`
- Para apuntar a otro servidor (por ejemplo AWS EC2), copia `.env.development.local.example` a `.env.development.local` y configura `VITE_API_BASE_URL`.

### 4. Despliegue opcional con Docker Compose (solo backend)
```bash
docker compose up --build -d
```

---

## 🧪 Pruebas y Calidad de Código

### Backend (7 pruebas de integración)
```bash
cd backend
mvn test
```
Valida OpenAPI/Swagger, protección JWT (`401`), registro/validaciones, CRUD con roles (`403` para usuarios sin permiso), estado `por_ver`, promedio de comunidad, CRUD de reseñas, gestión de usuarios admin, Top 4 favoritas y cambio de contraseña.

### Frontend (20 pruebas unitarias en Jasmine + Karma)
```bash
npm test
npm run lint
npm run build
```
Ejecuta las pruebas unitarias en `ChromeHeadless` (reporte en `coverage/`), validación estática con `oxlint` y compilación de producción con Vite.
