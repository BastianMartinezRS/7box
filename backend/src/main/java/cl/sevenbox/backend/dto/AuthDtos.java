package cl.sevenbox.backend.dto;

import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {

    private AuthDtos() {}

    public record AuthRequest(
            @NotBlank(message = "El nombre de usuario es obligatorio.")
            String username,
            @NotBlank(message = "La contraseña es obligatoria.")
            String password
    ) {}

    public record AuthResponse(
            String token,
            String username,
            String role,
            boolean esAdmin
    ) {}

    public record UserInfoResponse(
            String username,
            String role,
            boolean esAdmin
    ) {}
}
