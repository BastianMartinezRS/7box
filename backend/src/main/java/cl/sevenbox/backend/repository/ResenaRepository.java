package cl.sevenbox.backend.repository;

import cl.sevenbox.backend.model.Resena;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResenaRepository extends JpaRepository<Resena, Long> {
    @EntityGraph(attributePaths = {"usuario", "pelicula"})
    List<Resena> findByPeliculaIdOrderByFechaCreacionDesc(Long peliculaId);

    void deleteByPeliculaId(Long peliculaId);

    void deleteByUsuarioId(Long usuarioId);
}
