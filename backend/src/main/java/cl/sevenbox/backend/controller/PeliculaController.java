package cl.sevenbox.backend.controller;

import cl.sevenbox.backend.dto.PeliculaDtos.PeliculaRequest;
import cl.sevenbox.backend.dto.PeliculaDtos.PeliculaResponse;
import cl.sevenbox.backend.dto.PeliculaDtos.PerfilPeliculaRequest;
import cl.sevenbox.backend.service.PeliculaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/peliculas")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Películas", description = "Operaciones CRUD del catálogo de películas y perfil personal del usuario")
public class PeliculaController {

    private final PeliculaService peliculaService;

    public PeliculaController(PeliculaService peliculaService) {
        this.peliculaService = peliculaService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las películas con el estado y puntuación personal del usuario autenticado")
    public List<PeliculaResponse> listar(Authentication authentication) {
        return peliculaService.listarParaUsuario(authentication.getName());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una película por ID")
    public PeliculaResponse obtener(@PathVariable Long id, Authentication authentication) {
        return peliculaService.obtenerPorId(id, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear una nueva película en el catálogo (solo ADMIN)")
    public PeliculaResponse crear(@Valid @RequestBody PeliculaRequest request) {
        return peliculaService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar una película existente (solo ADMIN)")
    public PeliculaResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PeliculaRequest request,
            Authentication authentication) {
        return peliculaService.actualizar(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar una película del catálogo (solo ADMIN)")
    public void eliminar(@PathVariable Long id) {
        peliculaService.eliminar(id);
    }

    @PutMapping("/{id}/perfil")
    @Operation(summary = "Actualizar estado en lista personal y/o puntuación (1-5) del usuario autenticado")
    public PeliculaResponse actualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody PerfilPeliculaRequest request,
            Authentication authentication) {
        return peliculaService.actualizarPerfil(id, authentication.getName(), request);
    }
}
