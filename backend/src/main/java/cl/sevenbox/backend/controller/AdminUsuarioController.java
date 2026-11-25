package cl.sevenbox.backend.controller;

import cl.sevenbox.backend.dto.AdminDtos.CambiarRolRequest;
import cl.sevenbox.backend.dto.AdminDtos.UsuarioAdminResponse;
import cl.sevenbox.backend.service.AdminUsuarioService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Administración de Usuarios", description = "Gestión de usuarios y roles (solo ADMIN)")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios registrados (solo ADMIN)")
    public List<UsuarioAdminResponse> listarTodos() {
        return adminUsuarioService.listarTodos();
    }

    @PutMapping("/{id}/rol")
    @Operation(summary = "Cambiar el rol de un usuario entre ROLE_USER y ROLE_ADMIN (solo ADMIN)")
    public UsuarioAdminResponse cambiarRol(
            @PathVariable Long id,
            @Valid @RequestBody CambiarRolRequest request,
            Authentication authentication) {
        return adminUsuarioService.cambiarRol(id, request.role(), authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Eliminar un usuario del sistema (solo ADMIN)")
    public void eliminar(@PathVariable Long id, Authentication authentication) {
        adminUsuarioService.eliminar(id, authentication.getName());
    }
}
