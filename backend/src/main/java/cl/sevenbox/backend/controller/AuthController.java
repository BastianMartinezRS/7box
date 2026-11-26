package cl.sevenbox.backend.controller;

import cl.sevenbox.backend.dto.AuthDtos.AuthRequest;
import cl.sevenbox.backend.dto.AuthDtos.AuthResponse;
import cl.sevenbox.backend.dto.AuthDtos.ChangePasswordRequest;
import cl.sevenbox.backend.dto.AuthDtos.UserInfoResponse;
import cl.sevenbox.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Registro, inicio de sesión con JWT y verificación de sesión")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión y obtener token JWT")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar un nuevo usuario regular (ROLE_USER) y obtener token JWT")
    public AuthResponse register(@Valid @RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obtener información del usuario autenticado mediante el JWT")
    public UserInfoResponse me(Authentication authentication) {
        return authService.me(authentication.getName());
    }

    @PutMapping("/password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cambiar la contraseña del usuario autenticado")
    public Map<String, String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        authService.changePassword(authentication.getName(), request);
        return Map.of("message", "Contraseña actualizada correctamente.");
    }
}
