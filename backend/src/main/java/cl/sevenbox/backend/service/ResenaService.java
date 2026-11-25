package cl.sevenbox.backend.service;

import cl.sevenbox.backend.dto.ResenaDtos.ResenaRequest;
import cl.sevenbox.backend.dto.ResenaDtos.ResenaResponse;
import cl.sevenbox.backend.exception.BusinessException;
import cl.sevenbox.backend.exception.ResourceNotFoundException;
import cl.sevenbox.backend.model.Pelicula;
import cl.sevenbox.backend.model.Resena;
import cl.sevenbox.backend.model.Role;
import cl.sevenbox.backend.model.Usuario;
import cl.sevenbox.backend.repository.PeliculaRepository;
import cl.sevenbox.backend.repository.ResenaRepository;
import cl.sevenbox.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final PeliculaRepository peliculaRepository;
    private final UsuarioRepository usuarioRepository;

    public ResenaService(
            ResenaRepository resenaRepository,
            PeliculaRepository peliculaRepository,
            UsuarioRepository usuarioRepository) {
        this.resenaRepository = resenaRepository;
        this.peliculaRepository = peliculaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ResenaResponse> listarPorPelicula(Long peliculaId, String username) {
        if (!peliculaRepository.existsById(peliculaId)) {
            throw new ResourceNotFoundException("Película no encontrada con id: " + peliculaId);
        }
        return resenaRepository.findByPeliculaIdOrderByFechaCreacionDesc(peliculaId).stream()
                .map(r -> toResponse(r, username))
                .toList();
    }

    @Transactional
    public ResenaResponse crear(Long peliculaId, String username, ResenaRequest request) {
        Pelicula pelicula = peliculaRepository.findById(peliculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Película no encontrada con id: " + peliculaId));
        Usuario usuario = buscarUsuario(username);

        Resena resena = new Resena();
        resena.setPelicula(pelicula);
        resena.setUsuario(usuario);
        resena.setComentario(request.comentario().trim());
        resena.setPuntuacion(request.puntuacion());

        Resena guardada = resenaRepository.save(resena);
        return toResponse(guardada, username);
    }

    @Transactional
    public ResenaResponse actualizar(Long resenaId, String username, ResenaRequest request) {
        Resena resena = resenaRepository.findById(resenaId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada con id: " + resenaId));

        if (!resena.getUsuario().getUsername().equalsIgnoreCase(username)) {
            throw new BusinessException("Solo puedes editar tus propias reseñas.", HttpStatus.FORBIDDEN);
        }

        resena.setComentario(request.comentario().trim());
        resena.setPuntuacion(request.puntuacion());
        Resena guardada = resenaRepository.save(resena);
        return toResponse(guardada, username);
    }

    @Transactional
    public void eliminar(Long resenaId, String username) {
        Resena resena = resenaRepository.findById(resenaId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada con id: " + resenaId));
        Usuario solicitante = buscarUsuario(username);

        boolean esAutor = resena.getUsuario().getUsername().equalsIgnoreCase(username);
        boolean esAdmin = solicitante.getRole() == Role.ROLE_ADMIN;

        if (!esAutor && !esAdmin) {
            throw new BusinessException("No tienes permiso para eliminar esta reseña.", HttpStatus.FORBIDDEN);
        }

        resenaRepository.delete(resena);
    }

    private Usuario buscarUsuario(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    }

    private ResenaResponse toResponse(Resena r, String currentUsername) {
        boolean esMia = r.getUsuario().getUsername().equalsIgnoreCase(currentUsername);
        return new ResenaResponse(
                r.getId(),
                r.getPelicula().getId(),
                r.getUsuario().getUsername(),
                r.getComentario(),
                r.getPuntuacion(),
                r.getFechaCreacion(),
                r.getFechaActualizacion(),
                esMia
        );
    }
}
