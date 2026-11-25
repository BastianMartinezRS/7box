package cl.sevenbox.backend.repository;

import cl.sevenbox.backend.model.InteraccionUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InteraccionUsuarioRepository extends JpaRepository<InteraccionUsuario, Long> {
    List<InteraccionUsuario> findByUsuarioId(Long usuarioId);
    Optional<InteraccionUsuario> findByUsuarioIdAndPeliculaId(Long usuarioId, Long peliculaId);
    void deleteByPeliculaId(Long peliculaId);
    void deleteByUsuarioId(Long usuarioId);

    @Query("SELECT i.pelicula.id, AVG(i.miPuntuacion), COUNT(i.miPuntuacion) " +
           "FROM InteraccionUsuario i WHERE i.miPuntuacion IS NOT NULL GROUP BY i.pelicula.id")
    List<Object[]> findCommunityRatingStats();
}
