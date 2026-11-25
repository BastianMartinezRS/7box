package cl.sevenbox.backend.service;

import cl.sevenbox.backend.dto.AdminDtos.UsuarioAdminResponse;
import cl.sevenbox.backend.exception.BusinessException;
import cl.sevenbox.backend.exception.ResourceNotFoundException;
import cl.sevenbox.backend.model.Role;
import cl.sevenbox.backend.model.Usuario;
import cl.sevenbox.backend.repository.InteraccionUsuarioRepository;
import cl.sevenbox.backend.repository.ResenaRepository;
import cl.sevenbox.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final InteraccionUsuarioRepository interaccionRepository;
    private final ResenaRepository resenaRepository;

    public AdminUsuarioService(
            UsuarioRepository usuarioRepository,
            InteraccionUsuarioRepository interaccionRepository,
            ResenaRepository resenaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.interaccionRepository = interaccionRepository;
        this.resenaRepository = resenaRepository;
    }

    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listarTodos() {
        return usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UsuarioAdminResponse cambiarRol(Long id, String roleRaw, String adminUsername) {
        Usuario objetivo = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if ("admin".equalsIgnoreCase(objetivo.getUsername())) {
            throw new BusinessException("No se puede modificar el rol del administrador principal.", HttpStatus.BAD_REQUEST);
        }
        if (objetivo.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new BusinessException("No puedes cambiar tu propio rol mientras estás conectado.", HttpStatus.BAD_REQUEST);
        }

        Role nuevoRol;
        try {
            nuevoRol = Role.valueOf(roleRaw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Rol inválido. Valores permitidos: ROLE_USER, ROLE_ADMIN.", HttpStatus.BAD_REQUEST);
        }

        objetivo.setRole(nuevoRol);
        Usuario guardado = usuarioRepository.save(objetivo);
        return toResponse(guardado);
    }

    @Transactional
    public void eliminar(Long id, String adminUsername) {
        Usuario objetivo = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if ("admin".equalsIgnoreCase(objetivo.getUsername())) {
            throw new BusinessException("No se puede eliminar al administrador principal.", HttpStatus.BAD_REQUEST);
        }
        if (objetivo.getUsername().equalsIgnoreCase(adminUsername)) {
            throw new BusinessException("No puedes eliminar tu propia cuenta activa.", HttpStatus.BAD_REQUEST);
        }

        resenaRepository.deleteByUsuarioId(objetivo.getId());
        interaccionRepository.deleteByUsuarioId(objetivo.getId());
        usuarioRepository.delete(objetivo);
    }

    private UsuarioAdminResponse toResponse(Usuario u) {
        return new UsuarioAdminResponse(
                u.getId(),
                u.getUsername(),
                u.getRole().name(),
                u.getRole() == Role.ROLE_ADMIN
        );
    }
}
