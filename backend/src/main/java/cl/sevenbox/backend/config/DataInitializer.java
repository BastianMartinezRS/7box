package cl.sevenbox.backend.config;

import cl.sevenbox.backend.model.Pelicula;
import cl.sevenbox.backend.model.Role;
import cl.sevenbox.backend.model.Usuario;
import cl.sevenbox.backend.repository.PeliculaRepository;
import cl.sevenbox.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PeliculaRepository peliculaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PeliculaRepository peliculaRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.usuarioRepository = usuarioRepository;
        this.peliculaRepository = peliculaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        migrarColumnasEnum();
        seedUsuarios();
        seedPeliculas();
    }

    private void migrarColumnasEnum() {
        try {
            jdbcTemplate.execute("ALTER TABLE interacciones_usuario ALTER COLUMN estado_perfil VARCHAR(20)");
        } catch (Exception ignored) {
            // Ignorar si la tabla aun no existe o el motor SQL ya usa VARCHAR
        }
        try {
            jdbcTemplate.execute("ALTER TABLE usuarios ALTER COLUMN role VARCHAR(20)");
        } catch (Exception ignored) {
            // Ignorar si la tabla aun no existe o el motor SQL ya usa VARCHAR
        }
    }

    private void seedUsuarios() {
        if (!usuarioRepository.existsByUsernameIgnoreCase("admin")) {
            usuarioRepository.save(new Usuario(
                    "admin",
                    passwordEncoder.encode("admin"),
                    Role.ROLE_ADMIN
            ));
        }
        if (!usuarioRepository.existsByUsernameIgnoreCase("usuario")) {
            usuarioRepository.save(new Usuario(
                    "usuario",
                    passwordEncoder.encode("1234"),
                    Role.ROLE_USER
            ));
        }
    }

    private void seedPeliculas() {
        if (peliculaRepository.count() > 0) {
            return;
        }

        List<Pelicula> iniciales = List.of(
                crearPelicula("Spider-Man: Brand New Day", "Un nuevo comienzo, los mismos peligros.",
                        "Tras los eventos que cambiaron su vida, Peter Parker intenta forjar un nuevo camino en la ciudad de Nueva York mientras lidia con amenazas emergentes del inframundo criminal.",
                        "Destin Daniel Cretton", 3.9, "12K", "135 min", "2026-07-24",
                        List.of("Acción", "Aventura", "Ciencia Ficción"),
                        "https://a.ltrbxd.com/resized/film-poster/8/7/2/8/7/1/872871-spider-man-brand-new-day-0-1000-0-1500-crop.jpg?v=ebe6beb4fc",
                        "https://www.youtube.com/watch?v=JfVOs4VSpmA"),
                crearPelicula("The Odyssey", "El viaje épico de regreso a casa.",
                        "Una adaptación a gran escala del clásico poema de Homero, siguiendo a Odiseo en su desesperado y mítico viaje de diez años para regresar a Ítaca tras la Guerra de Troya.",
                        "Christopher Nolan", 4.0, "4.2K", "145 min", "2026",
                        List.of("Aventura", "Fantasía", "Drama"),
                        "https://a.ltrbxd.com/resized/film-poster/1/2/5/5/3/9/4/1255394-the-odyssey-2026-0-1000-0-1500-crop.jpg?v=1eed046d0c",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Mutiny", "Sobrevivir es el único plan.",
                        "Después de que su jefe multimillonario es asesinado frente a él, Cole Reed es incriminado por el crimen. Ahora, en fuga, debe descubrir una conspiración internacional para limpiar su nombre.",
                        "Jean-François Richet", 3.9, "3.5K", "115 min", "2026",
                        List.of("Acción", "Suspense"),
                        "https://a.ltrbxd.com/resized/film-poster/1/1/7/1/6/8/9/1171689-mutiny-2026-0-1000-0-1500-crop.jpg?v=71650d2444",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Coyote Vs Acme", "Nos vemos en los tribunales.",
                        "Harto de que todos los artefactos defectuosos se vuelvan en su contra, Wile E. Coyote decide contratar a un abogado para demandar a la Corporación ACME.",
                        "Dave Green", 4.1, "25K", "90 min", "2023-11-09",
                        List.of("Animación", "Comedia", "Familia"),
                        "https://a.ltrbxd.com/resized/film-poster/1/0/8/9/0/8/8/1089088-coyote-vs-acme-0-1000-0-1500-crop.jpg?v=735eb10cc7",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Dune: Part Two", "El viaje continúa.",
                        "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron su familia.",
                        "Denis Villeneuve", 4.6, "450K", "166 min", "2024-03-01",
                        List.of("Ciencia Ficción", "Aventura"),
                        "https://a.ltrbxd.com/resized/film-poster/6/1/7/4/4/3/617443-dune-part-two-0-1000-0-1500-crop.jpg?v=cc533700f8",
                        "https://www.youtube.com/watch?v=Way9Dexny3w"),
                crearPelicula("The Runner", "Cada segundo cuenta.",
                        "Atrapado en una red de espionaje, un mensajero de alto riesgo debe entregar un paquete letal antes de que el tiempo se agote, evadiendo asesinos por toda la ciudad.",
                        "David Cameron", 3.2, "1.8K", "105 min", "2026",
                        List.of("Acción", "Suspense"),
                        "https://a.ltrbxd.com/resized/film-poster/1/2/7/1/2/7/5/1271275-the-runner-2026-2-0-1000-0-1500-crop.jpg?v=d2e0c447b6",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Obsession", "Algunos deseos no tienen límites.",
                        "Un oscuro thriller psicológico que explora hasta dónde puede llegar una persona impulsada por una fijación incontrolable y letal hacia alguien de su pasado.",
                        "Curry Barker", 3.6, "2.1K", "112 min", "2025",
                        List.of("Suspense", "Misterio", "Drama"),
                        "https://a.ltrbxd.com/resized/film-poster/1/2/3/4/4/7/2/1234472-obsession-2025-2-0-1000-0-1500-crop.jpg?v=cff6fc00b6",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Minions & Monsters", "Una aventura monstruosamente divertida.",
                        "Los Minions se ven transportados a un universo de fantasía medieval donde deben enfrentarse a monstruos clásicos mientras intentan encontrar su camino de regreso.",
                        "Pierre Coffin", 3.5, "5.3K", "85 min", "2026",
                        List.of("Animación", "Comedia", "Aventura"),
                        "https://a.ltrbxd.com/resized/film-poster/1/1/9/6/8/0/8/1196808-minions-monsters-2026-0-1000-0-1500-crop.jpg?v=8ff282e996",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Moana", "El océano la está llamando.",
                        "Adaptación en acción real del clásico animado de Disney. Moana se embarca en una audaz misión para salvar a su pueblo con la ayuda del semidiós Maui.",
                        "Thomas Kail", 3.6, "18K", "115 min", "2026-07-10",
                        List.of("Aventura", "Fantasía", "Familia"),
                        "https://a.ltrbxd.com/resized/film-poster/1/0/0/0/2/7/7/1000277-moana-0-1000-0-1500-crop.jpg?v=e60c5cd42d",
                        "https://www.youtube.com/watch?v=LKFuXETZUsI"),
                crearPelicula("War of the Worlds", "La invasión ha comenzado.",
                        "Una reimaginación contemporánea de la novela de H.G. Wells, donde la humanidad lucha desesperadamente por su supervivencia ante un implacable ataque extraterrestre.",
                        "Rich Lee", 2.5, "3.2K", "122 min", "2025",
                        List.of("Ciencia Ficción", "Acción", "Suspense"),
                        "https://a.ltrbxd.com/resized/film-poster/6/7/6/5/4/5/676545-war-of-the-worlds-2025-0-1000-0-1500-crop.jpg?v=758c330585",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Everything Everywhere All at Once", "El universo es mucho más grande de lo que imaginas.",
                        "Una inmigrante china se ve envuelta en una aventura demencial donde solo ella puede salvar el mundo explorando otros universos y conectándose con las vidas que podría haber llevado.",
                        "Daniel Kwan, Daniel Scheinert", 4.5, "720K", "139 min", "2022-03-25",
                        List.of("Acción", "Aventura", "Comedia", "Ciencia Ficción"),
                        "https://a.ltrbxd.com/resized/film-poster/4/7/4/4/7/4/474474-everything-everywhere-all-at-once-0-1000-0-1500-crop.jpg?v=281f1a041e",
                        "https://www.youtube.com/watch?v=wxN1T1uxQ2g"),
                crearPelicula("Spider-Man: Across the Spider-Verse", "Es más que un héroe. Es cómo lleva la máscara.",
                        "Miles Morales se lanza a través del multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia.",
                        "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson", 4.7, "590K", "140 min", "2023-06-02",
                        List.of("Animación", "Acción", "Aventura", "Ciencia Ficción"),
                        "https://a.ltrbxd.com/resized/film-poster/4/9/7/6/3/1/497631-spider-man-across-the-spider-verse-0-1000-0-1500-crop.jpg?v=f2acbf1b8a",
                        "https://www.youtube.com/watch?v=cqGjhVJWtEg"),
                crearPelicula("Parasite", "Actúa como si fueras dueño del lugar.",
                        "Tanto Gi Taek como su familia están desempleados y tienen un interés peculiar en los opulentos y glamurosos estilos de vida de la familia Park, hasta que se ven envueltos en un incidente inesperado.",
                        "Bong Joon-ho", 4.6, "950K", "132 min", "2019-05-30",
                        List.of("Comedia", "Drama", "Thriller"),
                        "https://a.ltrbxd.com/resized/film-poster/4/2/6/4/0/6/426406-parasite-0-1000-0-1500-crop.jpg?v=8f5653f710",
                        "https://www.youtube.com/watch?v=5xH0HfJHsaY"),
                crearPelicula("Oppenheimer", "El mundo cambia para siempre.",
                        "La historia del físico estadounidense J. Robert Oppenheimer, su papel en el Proyecto Manhattan y el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.",
                        "Christopher Nolan", 4.5, "680K", "180 min", "2023-07-21",
                        List.of("Drama", "Historia"),
                        "https://a.ltrbxd.com/resized/film-poster/7/8/4/3/2/8/784328-oppenheimer-0-1000-0-1500-crop.jpg?v=e3c6e7a32c",
                        "https://www.youtube.com/watch?v=uYPbbksJxIg"),
                crearPelicula("Dragonball Evolution", "La leyenda cobra vida.",
                        "Un joven Goku emprende una búsqueda global para reunir las mágicas esferas del dragón y evitar que el malvado Lord Piccolo conquiste el mundo.",
                        "James Wong", 1.1, "95K", "85 min", "2009-04-08",
                        List.of("Acción", "Aventura", "Fantasía"),
                        "https://a.ltrbxd.com/resized/film-poster/4/3/2/9/8/43298-dragonball-evolution-0-1000-0-1500-crop.jpg?v=538cab37fb",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("The Last Airbender", "Las cuatro naciones. Un destino.",
                        "Un joven y reticente Avatar debe dominar los cuatro elementos para detener a la despiadada Nación del Fuego y restaurar el equilibrio en un mundo devastado por la guerra.",
                        "M. Night Shyamalan", 1.2, "180K", "103 min", "2010-07-01",
                        List.of("Acción", "Aventura", "Fantasía"),
                        "https://a.ltrbxd.com/resized/film-poster/4/6/4/5/5/46455-the-last-airbender-0-1000-0-1500-crop.jpg?v=fbb4ff717f",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Disaster Movie", "Lo llaman comedia, nosotros lo llamamos catástrofe.",
                        "Un grupo de jóvenes atractivos intenta sobrevivir a una serie de desastres naturales y ataques de iconos de la cultura pop en una caótica noche en Los Ángeles.",
                        "Jason Friedberg, Aaron Seltzer", 1.4, "75K", "87 min", "2008-08-29",
                        List.of("Comedia"),
                        "https://a.ltrbxd.com/resized/film-poster/4/3/5/8/1/43581-disaster-movie-0-1000-0-1500-crop.jpg?v=0ba9d2765a",
                        "https://www.youtube.com/watch?v=QDia3e12czc"),
                crearPelicula("Cats", "Música. Magia. Memoria.",
                        "En una noche trascendental, una tribu de gatos conocida como los Jellicles toma una decisión definitiva sobre qué miembro ascenderá al plano celestial.",
                        "Tom Hooper", 1.5, "110K", "110 min", "2019-12-20",
                        List.of("Fantasía", "Musical", "Comedia"),
                        "https://a.ltrbxd.com/resized/film-poster/4/6/5/9/7/8/465978-cats-0-1000-0-1500-crop.jpg?v=586897dd38",
                        null),
                crearPelicula("12 Angry Men", "La vida está en sus manos. La muerte está en sus mentes.",
                        "Un jurado compuesto por doce hombres debe decidir el destino de un joven acusado de asesinato en un juicio por homicidio, donde uno de los miembros intenta plantar la duda razonable.",
                        "Sidney Lumet", 4.8, "480K", "96 min", "1957-04-10",
                        List.of("Drama"),
                        "https://a.ltrbxd.com/resized/film-poster/5/1/7/0/0/51700-12-angry-men-0-1000-0-1500-crop.jpg?v=b8aaf291a9",
                        "https://www.youtube.com/watch?v=TEN-2uTi2c0"),
                crearPelicula("Harakiri", "El honor y la tragedia de un samurái.",
                        "Durante el Japón feudal, un samurái empobrecido llega a la mansión de un señor feudal solicitando realizar un ritual de suicidio honorable, desenterrando oscuros secretos del clan.",
                        "Masaki Kobayashi", 4.8, "130K", "133 min", "1962-09-15",
                        List.of("Acción", "Drama", "Historia"),
                        "https://a.ltrbxd.com/resized/film-poster/4/3/0/1/5/43015-harakiri-0-1000-0-1500-crop.jpg?v=007080a0fb",
                        "https://youtu.be/gfABwM-Ppng"),
                crearPelicula("The Godfather", "Una oferta que no puedes rechazar.",
                        "El patriarca envejecido de una dinastía del crimen organizado en la ciudad de Nueva York transfiere el control de su imperio clandestino a su reacio hijo menor.",
                        "Francis Ford Coppola", 4.7, "980K", "175 min", "1972-03-14",
                        List.of("Crimen", "Drama"),
                        "https://a.ltrbxd.com/resized/film-poster/5/1/8/1/8/51818-the-godfather-0-1000-0-1500-crop.jpg?v=bca8b67402",
                        "https://www.youtube.com/watch?v=UaVTIH8mujA"),
                crearPelicula("The Shawshank Redemption", "La esperanza te hace libre.",
                        "Un banquero es condenado a cadena perpetua en la prisión de Shawshank por los asesinatos de su esposa y su amante, donde entabla una amistad transformadora a lo largo de décadas.",
                        "Frank Darabont", 4.7, "1.3M", "142 min", "1994-09-23",
                        List.of("Drama", "Crimen"),
                        "https://a.ltrbxd.com/resized/sm/upload/7l/hn/46/uz/zGINvGjdlO6TJRu9wESQvWlOKVT-0-1000-0-1500-crop.jpg?v=8736d1c395",
                        "https://www.youtube.com/watch?v=NmzuHjWmXOc"),
                crearPelicula("Come and See", "Ven y mira los horrores de la guerra.",
                        "Un joven bielorruso se une a la resistencia soviética contra las fuerzas nazis durante la Segunda Guerra Mundial, experimentando de primera mano los horrores más brutales del conflicto.",
                        "Elem Klimov", 4.7, "190K", "142 min", "1985-10-17",
                        List.of("Drama", "Historia", "Guerra"),
                        "https://a.ltrbxd.com/resized/film-poster/3/6/1/9/2/36192-come-and-see-0-1000-0-1500-crop.jpg?v=741b0269bb",
                        "https://www.youtube.com/watch?v=UHaSQU-4wss")
        );

        peliculaRepository.saveAll(iniciales);
    }

    private Pelicula crearPelicula(
            String titulo,
            String tagline,
            String sinopsis,
            String director,
            double nota,
            String votos,
            String duracion,
            String fecha,
            List<String> generos,
            String imagen,
            String trailer) {
        Pelicula p = new Pelicula();
        p.setTitulo(titulo);
        p.setTagline(tagline);
        p.setSinopsis(sinopsis);
        p.setDirector(director);
        p.setNota(nota);
        p.setVotos(votos);
        p.setDuracion(duracion);
        p.setFecha(fecha);
        p.setGeneros(generos);
        p.setCategoria("emision");
        p.setImagen(imagen);
        p.setTrailer(trailer);
        return p;
    }
}
