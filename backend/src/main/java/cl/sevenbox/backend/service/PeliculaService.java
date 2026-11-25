package cl.sevenbox.backend.service;

import cl.sevenbox.backend.dto.PeliculaDtos.PeliculaRequest;
import cl.sevenbox.backend.dto.PeliculaDtos.PeliculaResponse;
import cl.sevenbox.backend.dto.PeliculaDtos.PerfilPeliculaRequest;
import cl.sevenbox.backend.exception.ResourceNotFoundException;
import cl.sevenbox.backend.model.EstadoPerfil;
import cl.sevenbox.backend.model.InteraccionUsuario;
import cl.sevenbox.backend.model.Pelicula;
import cl.sevenbox.backend.model.Usuario;
import cl.sevenbox.backend.repository.InteraccionUsuarioRepository;
import cl.sevenbox.backend.repository.PeliculaRepository;
import cl.sevenbox.backend.repository.ResenaRepository;
import cl.sevenbox.backend.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PeliculaService {

    private record CommunityStats(Double promedio, Long totalVotos) {}

    private final PeliculaRepository peliculaRepository;
    private final UsuarioRepository usuarioRepository;
    private final InteraccionUsuarioRepository interaccionRepository;
    private final ResenaRepository resenaRepository;

    public PeliculaService(
            PeliculaRepository peliculaRepository,
            UsuarioRepository usuarioRepository,
            InteraccionUsuarioRepository interaccionRepository,
            ResenaRepository resenaRepository) {
        this.peliculaRepository = peliculaRepository;
        this.usuarioRepository = usuarioRepository;
        this.interaccionRepository = interaccionRepository;
        this.resenaRepository = resenaRepository;
    }

    @Transactional(readOnly = true)
    public List<PeliculaResponse> listarParaUsuario(String username) {
        Usuario usuario = buscarUsuario(username);
        Map<Long, InteraccionUsuario> interaccionesPorPelicula = interaccionRepository.findByUsuarioId(usuario.getId())
                .stream()
                .collect(Collectors.toMap(i -> i.getPelicula().getId(), Function.identity()));
        Map<Long, CommunityStats> statsPorPelicula = cargarEstadisticasComunidad();

        return peliculaRepository.findAllByOrderByIdDesc().stream()
                .map(p -> toResponse(p, interaccionesPorPelicula.get(p.getId()), statsPorPelicula.get(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PeliculaResponse obtenerPorId(Long id, String username) {
        Usuario usuario = buscarUsuario(username);
        Pelicula pelicula = buscarPelicula(id);
        InteraccionUsuario interaccion = interaccionRepository
                .findByUsuarioIdAndPeliculaId(usuario.getId(), pelicula.getId())
                .orElse(null);
        CommunityStats stats = cargarEstadisticasComunidad().get(pelicula.getId());
        return toResponse(pelicula, interaccion, stats);
    }

    @Transactional
    public PeliculaResponse crear(PeliculaRequest request) {
        Pelicula pelicula = new Pelicula();
        aplicarCampos(pelicula, request);
        if (pelicula.getVotos() == null || pelicula.getVotos().isBlank()) {
            pelicula.setVotos("1");
        }
        if (pelicula.getFecha() == null || pelicula.getFecha().isBlank()) {
            pelicula.setFecha(LocalDate.now().toString());
        }
        if (pelicula.getCategoria() == null || pelicula.getCategoria().isBlank()) {
            pelicula.setCategoria("emision");
        }
        Pelicula guardada = peliculaRepository.save(pelicula);
        return toResponse(guardada, null, null);
    }

    @Transactional
    public PeliculaResponse actualizar(Long id, PeliculaRequest request, String username) {
        Pelicula pelicula = buscarPelicula(id);
        aplicarCampos(pelicula, request);
        Pelicula guardada = peliculaRepository.save(pelicula);

        Usuario usuario = buscarUsuario(username);
        InteraccionUsuario interaccion = interaccionRepository
                .findByUsuarioIdAndPeliculaId(usuario.getId(), guardada.getId())
                .orElse(null);
        CommunityStats stats = cargarEstadisticasComunidad().get(guardada.getId());
        return toResponse(guardada, interaccion, stats);
    }

    @Transactional
    public void eliminar(Long id) {
        Pelicula pelicula = buscarPelicula(id);
        resenaRepository.deleteByPeliculaId(pelicula.getId());
        interaccionRepository.deleteByPeliculaId(pelicula.getId());
        peliculaRepository.delete(pelicula);
    }

    @Transactional
    public PeliculaResponse actualizarPerfil(Long peliculaId, String username, PerfilPeliculaRequest request) {
        Usuario usuario = buscarUsuario(username);
        Pelicula pelicula = buscarPelicula(peliculaId);

        InteraccionUsuario interaccion = interaccionRepository
                .findByUsuarioIdAndPeliculaId(usuario.getId(), pelicula.getId())
                .orElseGet(() -> new InteraccionUsuario(usuario, pelicula));

        if (request.estadoPerfil() != null) {
            interaccion.setEstadoPerfil(EstadoPerfil.fromString(request.estadoPerfil()));
        }

        if (Boolean.TRUE.equals(request.quitarPuntuacion())) {
            interaccion.setMiPuntuacion(null);
        } else if (request.miPuntuacion() != null) {
            interaccion.setMiPuntuacion(request.miPuntuacion());
        }

        InteraccionUsuario guardada = interaccionRepository.save(interaccion);
        CommunityStats stats = cargarEstadisticasComunidad().get(pelicula.getId());
        return toResponse(pelicula, guardada, stats);
    }

    private Map<Long, CommunityStats> cargarEstadisticasComunidad() {
        Map<Long, CommunityStats> stats = new HashMap<>();
        for (Object[] row : interaccionRepository.findCommunityRatingStats()) {
            Long peliculaId = (Long) row[0];
            Double avg = row[1] != null ? Math.round(((Number) row[1]).doubleValue() * 10.0) / 10.0 : null;
            Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            stats.put(peliculaId, new CommunityStats(avg, count));
        }
        return stats;
    }

    private void aplicarCampos(Pelicula pelicula, PeliculaRequest request) {
        pelicula.setTitulo(request.titulo().trim());
        pelicula.setTagline(limpiarOpcional(request.tagline()));
        pelicula.setSinopsis(limpiarOpcional(request.sinopsis()));
        pelicula.setDirector(limpiarOpcional(request.director()));
        pelicula.setNota(request.nota());
        if (request.votos() != null && !request.votos().isBlank()) {
            pelicula.setVotos(request.votos().trim());
        }
        pelicula.setDuracion(limpiarOpcional(request.duracion()));
        if (request.fecha() != null && !request.fecha().isBlank()) {
            pelicula.setFecha(request.fecha().trim());
        }
        if (request.categoria() != null && !request.categoria().isBlank()) {
            pelicula.setCategoria(request.categoria().trim());
        }
        pelicula.setImagen(request.imagen().trim());
        pelicula.setTrailer(limpiarOpcional(request.trailer()));

        List<String> generosLimpios = request.generos() == null
                ? List.of()
                : request.generos().stream()
                        .map(String::trim)
                        .filter(g -> !g.isEmpty())
                        .toList();
        pelicula.setGeneros(generosLimpios);
    }

    private String limpiarOpcional(String valor) {
        if (valor == null) {
            return null;
        }
        String trimmed = valor.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Usuario buscarUsuario(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
    }

    private Pelicula buscarPelicula(Long id) {
        return peliculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Película no encontrada con id: " + id));
    }

    private PeliculaResponse toResponse(Pelicula p, InteraccionUsuario interaccion, CommunityStats stats) {
        String estado = interaccion != null && interaccion.getEstadoPerfil() != null
                ? interaccion.getEstadoPerfil().getValor()
                : EstadoPerfil.NINGUNO.getValor();
        Integer puntuacion = interaccion != null ? interaccion.getMiPuntuacion() : null;
        Double promedio = stats != null ? stats.promedio() : null;
        Long totalVotos = stats != null ? stats.totalVotos() : 0L;

        return new PeliculaResponse(
                p.getId(),
                p.getTitulo(),
                p.getTagline(),
                p.getSinopsis(),
                p.getDirector(),
                p.getNota(),
                p.getVotos(),
                p.getDuracion(),
                p.getFecha(),
                List.copyOf(p.getGeneros()),
                p.getCategoria(),
                p.getImagen(),
                p.getTrailer(),
                estado,
                puntuacion,
                promedio,
                totalVotos
        );
    }
}
