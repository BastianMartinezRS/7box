package cl.sevenbox.backend.service;

import cl.sevenbox.backend.dto.AuthDtos.AuthRequest;
import cl.sevenbox.backend.dto.AuthDtos.AuthResponse;
import cl.sevenbox.backend.dto.AuthDtos.ChangePasswordRequest;
import cl.sevenbox.backend.dto.AuthDtos.UserInfoResponse;
import cl.sevenbox.backend.exception.BusinessException;
import cl.sevenbox.backend.exception.ResourceNotFoundException;
import cl.sevenbox.backend.model.Role;
import cl.sevenbox.backend.model.Usuario;
import cl.sevenbox.backend.repository.UsuarioRepository;
import cl.sevenbox.backend.security.JwtService;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+$");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AuthRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String password = request.password() == null ? "" : request.password();

        if (username.isEmpty()) {
            throw new BusinessException("Por favor ingresa tu nombre de usuario.", HttpStatus.BAD_REQUEST);
        }
        if (password.isEmpty()) {
            throw new BusinessException("Por favor ingresa tu contraseña.", HttpStatus.BAD_REQUEST);
        }

        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new BusinessException(
                        "El usuario \"" + username + "\" no existe. Regístrate en la pestaña \"Registrarse\".",
                        HttpStatus.UNAUTHORIZED
                ));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuario.getUsername(), password)
            );
        } catch (BadCredentialsException ex) {
            throw new BusinessException("Contraseña incorrecta.", HttpStatus.UNAUTHORIZED);
        }

        return buildAuthResponse(usuario);
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String password = request.password() == null ? "" : request.password();

        if (username.isEmpty()) {
            throw new BusinessException("El nombre de usuario es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (username.length() < 3) {
            throw new BusinessException("El nombre de usuario debe tener al menos 3 caracteres.", HttpStatus.BAD_REQUEST);
        }
        if (username.length() > 20) {
            throw new BusinessException("El nombre de usuario no puede tener más de 20 caracteres.", HttpStatus.BAD_REQUEST);
        }
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new BusinessException(
                    "El usuario solo puede tener letras, números, guiones (-) y guiones bajos (_).",
                    HttpStatus.BAD_REQUEST
            );
        }
        if ("admin".equalsIgnoreCase(username)) {
            throw new BusinessException(
                    "El usuario \"admin\" está reservado para el administrador del sistema.",
                    HttpStatus.BAD_REQUEST
            );
        }
        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            throw new BusinessException(
                    "El usuario \"" + username + "\" ya está registrado. Por favor elige otro.",
                    HttpStatus.CONFLICT
            );
        }
        if (password.trim().isEmpty()) {
            throw new BusinessException("La contraseña es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        if (password.length() < 4) {
            throw new BusinessException("La contraseña debe tener al menos 4 caracteres.", HttpStatus.BAD_REQUEST);
        }
        if (password.length() > 50) {
            throw new BusinessException("La contraseña no puede exceder 50 caracteres.", HttpStatus.BAD_REQUEST);
        }

        Usuario nuevo = new Usuario(username, passwordEncoder.encode(password), Role.ROLE_USER);
        Usuario guardado = usuarioRepository.save(nuevo);
        return buildAuthResponse(guardado);
    }

    public UserInfoResponse me(String username) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        return new UserInfoResponse(
                usuario.getUsername(),
                usuario.getRole().name(),
                usuario.getRole() == Role.ROLE_ADMIN
        );
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        String actual = request.currentPassword() == null ? "" : request.currentPassword();
        String nueva = request.newPassword() == null ? "" : request.newPassword();

        if (!passwordEncoder.matches(actual, usuario.getPassword())) {
            throw new BusinessException("La contraseña actual es incorrecta.", HttpStatus.BAD_REQUEST);
        }
        if (nueva.trim().isEmpty()) {
            throw new BusinessException("La nueva contraseña es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        if (nueva.length() < 4) {
            throw new BusinessException("La nueva contraseña debe tener al menos 4 caracteres.", HttpStatus.BAD_REQUEST);
        }
        if (nueva.length() > 50) {
            throw new BusinessException("La nueva contraseña no puede exceder 50 caracteres.", HttpStatus.BAD_REQUEST);
        }

        usuario.setPassword(passwordEncoder.encode(nueva));
        usuarioRepository.save(usuario);
    }

    private AuthResponse buildAuthResponse(Usuario usuario) {
        String token = jwtService.generateToken(usuario);
        return new AuthResponse(
                token,
                usuario.getUsername(),
                usuario.getRole().name(),
                usuario.getRole() == Role.ROLE_ADMIN
        );
    }
}
