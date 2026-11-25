package cl.sevenbox.backend.repository;

import cl.sevenbox.backend.model.Pelicula;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeliculaRepository extends JpaRepository<Pelicula, Long> {
    List<Pelicula> findAllByOrderByIdDesc();
}
