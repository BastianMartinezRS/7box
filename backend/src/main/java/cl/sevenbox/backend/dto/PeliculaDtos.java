package cl.sevenbox.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class PeliculaDtos {

    private PeliculaDtos() {}

    public record PeliculaRequest(
            @NotBlank(message = "El título es obligatorio.")
            String titulo,
            String tagline,
            String sinopsis,
            String director,
            @NotNull(message = "La nota IMDb es obligatoria.")
            @DecimalMin(value = "0.0", message = "La nota mínima es 0.0.")
            @DecimalMax(value = "10.0", message = "La nota máxima es 10.0.")
            Double nota,
            String votos,
            String duracion,
            String fecha,
            List<String> generos,
            String categoria,
            @NotBlank(message = "La URL de la imagen es obligatoria.")
            String imagen,
            String trailer
    ) {}

    public record PeliculaResponse(
            Long id,
            String titulo,
            String tagline,
            String sinopsis,
            String director,
            Double nota,
            String votos,
            String duracion,
            String fecha,
            List<String> generos,
            String categoria,
            String imagen,
            String trailer,
            String estadoPerfil,
            Integer miPuntuacion,
            Double promedioComunidad,
            Long totalVotosComunidad
    ) {}

    public record PerfilPeliculaRequest(
            String estadoPerfil,
            @Min(value = 1, message = "La puntuación mínima es 1.")
            @Max(value = 5, message = "La puntuación máxima es 5.")
            Integer miPuntuacion,
            Boolean quitarPuntuacion
    ) {}
}
