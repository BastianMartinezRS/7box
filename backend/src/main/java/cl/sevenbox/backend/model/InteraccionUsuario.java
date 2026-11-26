package cl.sevenbox.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "interacciones_usuario",
    uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "pelicula_id"})
)
public class InteraccionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pelicula_id", nullable = false)
    private Pelicula pelicula;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private EstadoPerfil estadoPerfil = EstadoPerfil.NINGUNO;

    @Column
    private Integer miPuntuacion;

    public InteraccionUsuario() {}

    public InteraccionUsuario(Usuario usuario, Pelicula pelicula) {
        this.usuario = usuario;
        this.pelicula = pelicula;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Pelicula getPelicula() {
        return pelicula;
    }

    public void setPelicula(Pelicula pelicula) {
        this.pelicula = pelicula;
    }

    public EstadoPerfil getEstadoPerfil() {
        return estadoPerfil;
    }

    public void setEstadoPerfil(EstadoPerfil estadoPerfil) {
        this.estadoPerfil = estadoPerfil;
    }

    public Integer getMiPuntuacion() {
        return miPuntuacion;
    }

    public void setMiPuntuacion(Integer miPuntuacion) {
        this.miPuntuacion = miPuntuacion;
    }
}
