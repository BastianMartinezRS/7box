package cl.sevenbox.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public final class ResenaDtos {

    private ResenaDtos() {}

    public record ResenaRequest(
            @NotBlank(message = "El comentario de la reseña es obligatorio.")
            @Size(max = 1000, message = "La reseña no puede superar los 1000 caracteres.")
            String comentario,
            @Min(value = 1, message = "La puntuación mínima es 1.")
            @Max(value = 5, message = "La puntuación máxima es 5.")
            Integer puntuacion
    ) {}

    public record ResenaResponse(
            Long id,
            Long peliculaId,
            String username,
            String comentario,
            Integer puntuacion,
            LocalDateTime fechaCreacion,
            LocalDateTime fechaActualizacion,
            boolean esMia
    ) {}
}
