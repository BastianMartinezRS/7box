package cl.sevenbox.backend.repository;

import cl.sevenbox.backend.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
}
