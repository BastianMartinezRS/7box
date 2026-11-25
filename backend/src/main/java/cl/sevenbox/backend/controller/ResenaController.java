package cl.sevenbox.backend.controller;

import cl.sevenbox.backend.dto.ResenaDtos.ResenaRequest;
import cl.sevenbox.backend.dto.ResenaDtos.ResenaResponse;
import cl.sevenbox.backend.service.ResenaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reseñas", description = "CRUD de reseñas de la comunidad sobre películas")
public class ResenaController {

    private final ResenaService resenaService;

    public ResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    @GetMapping("/peliculas/{peliculaId}/resenas")
    @Operation(summary = "Listar reseñas de una película")
    public List<ResenaResponse> listarPorPelicula(@PathVariable Long peliculaId, Authentication authentication) {
        return resenaService.listarPorPelicula(peliculaId, authentication.getName());
    }

    @PostMapping("/peliculas/{peliculaId}/resenas")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Publicar una nueva reseña sobre una película")
    public ResenaResponse crear(
            @PathVariable Long peliculaId,
            @Valid @RequestBody ResenaRequest request,
            Authentication authentication) {
        return resenaService.crear(peliculaId, authentication.getName(), request);
    }

    @PutMapping("/resenas/{resenaId}")
    @Operation(summary = "Editar una reseña propia")
    public ResenaResponse actualizar(
            @PathVariable Long resenaId,
            @Valid @RequestBody ResenaRequest request,
            Authentication authentication) {
        return resenaService.actualizar(resenaId, authentication.getName(), request);
    }

    @DeleteMapping("/resenas/{resenaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar una reseña (autor o ADMIN)")
    public void eliminar(@PathVariable Long resenaId, Authentication authentication) {
        resenaService.eliminar(resenaId, authentication.getName());
    }
}
