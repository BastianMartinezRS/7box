package cl.sevenbox.backend.model;

import java.util.Locale;

public enum EstadoPerfil {
    NINGUNO("ninguno"),
    POR_VER("por_ver"),
    VISTA("vista"),
    ABANDONADA("abandonada"),
    NO_GUSTO("no_gusto");

    private final String valor;

    EstadoPerfil(String valor) {
        this.valor = valor;
    }

    public String getValor() {
        return valor;
    }

    public static EstadoPerfil fromString(String raw) {
        if (raw == null || raw.isBlank()) {
            return NINGUNO;
        }
        String normalizado = raw.trim().toLowerCase(Locale.ROOT);
        for (EstadoPerfil estado : values()) {
            if (estado.valor.equals(normalizado) || estado.name().toLowerCase(Locale.ROOT).equals(normalizado)) {
                return estado;
            }
        }
        throw new IllegalArgumentException(
                "Estado de perfil inválido: " + raw + ". Valores permitidos: ninguno, por_ver, vista, abandonada, no_gusto"
        );
    }
}
