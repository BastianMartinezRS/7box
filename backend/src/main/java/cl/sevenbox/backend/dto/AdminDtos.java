package cl.sevenbox.backend.dto;

import jakarta.validation.constraints.NotBlank;

public final class AdminDtos {

    private AdminDtos() {}

    public record UsuarioAdminResponse(
            Long id,
            String username,
            String role,
            boolean esAdmin
    ) {}

    public record CambiarRolRequest(
            @NotBlank(message = "El rol es obligatorio.")
            String role
    ) {}
}
