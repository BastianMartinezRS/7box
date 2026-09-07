document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURACIÓN INICIAL DE ADMINISTRADOR
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (!usuarios.some(u => u.nombre === "admin")) {
    usuarios.push({ nombre: "admin", clave: "admin123", esAdmin: true });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
  const esPaginaLogin = window.location.pathname.includes("login.html");

  if (!usuarioActual && !esPaginaLogin) {
    window.location.href = "login.html";
    return;
  }

  inicializarBaseDeDatos();
  verificarSesionYRol(usuarioActual);
  cargarCatalogo();
  inicializarEventos();
});


const peliculasIniciales = [
  { 
    id: 1, 
    titulo: "Spider-Man: Brand New Day", 
    tagline: "Un nuevo comienzo, los mismos peligros.",
    sinopsis: "Tras los eventos que cambiaron su vida, Peter Parker intenta forjar un nuevo camino en la ciudad de Nueva York mientras lidia con amenazas emergentes del inframundo criminal.",
    director: "Destin Daniel Cretton",
    nota: "3.9",
    votos: "12K",
    duracion: "135 min",
    fecha: "2026-07-24",
    generos: ["Acción", "Aventura", "Ciencia Ficción"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/8/7/2/8/7/1/872871-spider-man-brand-new-day-0-1000-0-1500-crop.jpg?v=ebe6beb4fc",
    trailer: "https://www.youtube.com/watch?v=JfVOs4VSpmA"
  },
  { 
    id: 2, 
    titulo: "The Odyssey", 
    tagline: "El viaje épico de regreso a casa.",
    sinopsis: "Una adaptación a gran escala del clásico poema de Homero, siguiendo a Odiseo en su desesperado y mítico viaje de diez años para regresar a Ítaca tras la Guerra de Troya.",
    director: "Christopher Nolan",
    nota: "4.0", 
    votos: "4.2K",
    duracion: "145 min",
    fecha: "2026",
    generos: ["Aventura", "Fantasía", "Drama"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/2/5/5/3/9/4/1255394-the-odyssey-2026-0-1000-0-1500-crop.jpg?v=1eed046d0c",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 3, 
    titulo: "Mutiny", 
    tagline: "Sobrevivir es el único plan.",
    sinopsis: "Después de que su jefe multimillonario es asesinado frente a él, Cole Reed es incriminado por el crimen. Ahora, en fuga, debe descubrir una conspiración internacional para limpiar su nombre.",
    director: "Jean-François Richet",
    nota: "3.9", 
    votos: "3.5K",
    duracion: "115 min",
    fecha: "2026",
    generos: ["Acción", "Suspense"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/1/7/1/6/8/9/1171689-mutiny-2026-0-1000-0-1500-crop.jpg?v=71650d2444",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 4, 
    titulo: "Coyote Vs Acme", 
    tagline: "Nos vemos en los tribunales.",
    sinopsis: "Harto de que todos los artefactos defectuosos se vuelvan en su contra, Wile E. Coyote decide contratar a un abogado para demandar a la Corporación ACME.",
    director: "Dave Green",
    nota: "4.1", 
    votos: "25K",
    duracion: "90 min",
    fecha: "2023-11-09",
    generos: ["Animación", "Comedia", "Familia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/0/8/9/0/8/8/1089088-coyote-vs-acme-0-1000-0-1500-crop.jpg?v=735eb10cc7",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 5, 
    titulo: "The Runner", 
    tagline: "Cada segundo cuenta.",
    sinopsis: "Atrapado en una red de espionaje, un mensajero de alto riesgo debe entregar un paquete letal antes de que el tiempo se agote, evadiendo asesinos por toda la ciudad.",
    director: "David Cameron",
    nota: "3.2", 
    votos: "1.8K",
    duracion: "105 min",
    fecha: "2026",
    generos: ["Acción", "Suspense"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/2/7/1/2/7/5/1271275-the-runner-2026-2-0-1000-0-1500-crop.jpg?v=d2e0c447b6",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 6, 
    titulo: "Obsession", 
    tagline: "Algunos deseos no tienen límites.",
    sinopsis: "Un oscuro thriller psicológico que explora hasta dónde puede llegar una persona impulsada por una fijación incontrolable y letal hacia alguien de su pasado.",
    director: "Curry Barker",
    nota: "3.6", 
    votos: "2.1K",
    duracion: "112 min",
    fecha: "2025",
    generos: ["Suspense", "Misterio", "Drama"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/2/3/4/4/7/2/1234472-obsession-2025-2-0-1000-0-1500-crop.jpg?v=cff6fc00b6",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 7, 
    titulo: "Minions & Monsters", 
    tagline: "Una aventura monstruosamente divertida.",
    sinopsis: "Los Minions se ven transportados a un universo de fantasía medieval donde deben enfrentarse a monstruos clásicos mientras intentan encontrar su camino de regreso.",
    director: "Pierre Coffin",
    nota: "3.5", 
    votos: "5.3K",
    duracion: "85 min",
    fecha: "2026",
    generos: ["Animación", "Comedia", "Aventura"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/1/9/6/8/0/8/1196808-minions-monsters-2026-0-1000-0-1500-crop.jpg?v=8ff282e996",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 8, 
    titulo: "Moana", 
    tagline: "El océano la está llamando.",
    sinopsis: "Adaptación en acción real del clásico animado de Disney. Moana se embarca en una audaz misión para salvar a su pueblo con la ayuda del semidiós Maui.",
    director: "Thomas Kail",
    nota: "3.6", 
    votos: "18K",
    duracion: "115 min",
    fecha: "2026-07-10",
    generos: ["Aventura", "Fantasía", "Familia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/1/0/0/0/2/7/7/1000277-moana-0-1000-0-1500-crop.jpg?v=e60c5cd42d",
    trailer: "https://www.youtube.com/watch?v=LKFuXETZUsI"
  },
  {
    id: 9,
    titulo: "War of the Worlds",
    tagline: "La invasión ha comenzado.",
    sinopsis: "Una reimaginación contemporánea de la novela de H.G. Wells, donde la humanidad lucha desesperadamente por su supervivencia ante un implacable ataque extraterrestre.",
    director: "Rich Lee",
    nota: "2.5",
    votos: "3.2K",
    duracion: "122 min",
    fecha: "2025",
    generos: ["Ciencia Ficción", "Acción", "Suspense"],
    categoria: "emision",
    imagen: "https://a.ltrbxd.com/resized/film-poster/6/7/6/5/4/5/676545-war-of-the-worlds-2025-0-1000-0-1500-crop.jpg?v=758c330585",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 10, 
    titulo: "Dune: Part Two", 
    tagline: "El viaje continúa.",
    sinopsis: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron su familia, enfrentándose a una elección entre el amor de su vida y el destino del universo.",
    director: "Denis Villeneuve",
    nota: "4.6",
    votos: "450K",
    duracion: "166 min",
    fecha: "2024-03-01",
    generos: ["Ciencia Ficción", "Aventura"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/6/1/7/4/4/3/617443-dune-part-two-0-1000-0-1500-crop.jpg?v=cc533700f8",
    trailer: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  { 
    id: 11, 
    titulo: "Everything Everywhere All at Once", 
    tagline: "El universo es mucho más grande de lo que imaginas.",
    sinopsis: "Una inmigrante china se ve envuelta en una aventura demencial donde solo ella puede salvar el mundo explorando otros universos y conectándose con las vidas que podría haber llevado.",
    director: "Daniel Kwan, Daniel Scheinert",
    nota: "4.5",
    votos: "720K",
    duracion: "139 min",
    fecha: "2022-03-25",
    generos: ["Acción", "Aventura", "Comedia", "Ciencia Ficción"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/7/4/4/7/4/474474-everything-everywhere-all-at-once-0-1000-0-1500-crop.jpg?v=281f1a041e",
    trailer: "https://www.youtube.com/watch?v=wxN1T1uxQ2g"
  },
  { 
    id: 12, 
    titulo: "Spider-Man: Across the Spider-Verse", 
    tagline: "Es más que un héroe. Es cómo lleva la máscara.",
    sinopsis: "Miles Morales se lanza a través del multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia. Pero cuando los héroes chocan sobre cómo manejar una nueva amenaza, Miles debe enfrentarse a los demás.",
    director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
    nota: "4.7",
    votos: "590K",
    duracion: "140 min",
    fecha: "2023-06-02",
    generos: ["Animación", "Acción", "Aventura", "Ciencia Ficción"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/9/7/6/3/1/497631-spider-man-across-the-spider-verse-0-1000-0-1500-crop.jpg?v=f2acbf1b8a",
    trailer: "https://www.youtube.com/watch?v=cqGjhVJWtEg"
  },
  { 
    id: 13, 
    titulo: "Parasite", 
    tagline: "Actúa como si fueras dueño del lugar.",
    sinopsis: "Tanto Gi Taek como su familia están desempleados y tienen un interés peculiar en los opulentos y glamurosos estilos de vida de la familia Park, hasta que se ven envueltos en un incidente inesperado.",
    director: "Bong Joon-ho",
    nota: "4.6",
    votos: "950K",
    duracion: "132 min",
    fecha: "2019-05-30",
    generos: ["Comedia", "Drama", "Thriller"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/2/6/4/0/6/426406-parasite-0-1000-0-1500-crop.jpg?v=8f5653f710",
    trailer: "https://www.youtube.com/watch?v=5xH0HfJHsaY"
  },
  { 
    id: 14, 
    titulo: "Oppenheimer", 
    tagline: "El mundo cambia para siempre.",
    sinopsis: "La historia del físico estadounidense J. Robert Oppenheimer, su papel en el Proyecto Manhattan y el desarrollo de la bomba atómica durante la Segunda Guerra Mundial.",
    director: "Christopher Nolan",
    nota: "4.5",
    votos: "680K",
    duracion: "180 min",
    fecha: "2023-07-21",
    generos: ["Drama", "Historia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/7/8/4/3/2/8/784328-oppenheimer-0-1000-0-1500-crop.jpg?v=e3c6e7a32c",
    trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  { 
    id: 15, 
    titulo: "Dragonball Evolution", 
    tagline: "La leyenda cobra vida.",
    sinopsis: "Un joven Goku emprende una búsqueda global para reunir las mágicas esferas del dragón y evitar que el malvado Lord Piccolo conquiste el mundo.",
    director: "James Wong",
    nota: "1.1",
    votos: "95K",
    duracion: "85 min",
    fecha: "2009-04-08",
    generos: ["Acción", "Aventura", "Fantasía"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/3/2/9/8/43298-dragonball-evolution-0-1000-0-1500-crop.jpg?v=538cab37fb",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 16, 
    titulo: "The Last Airbender", 
    tagline: "Las cuatro naciones. Un destino.",
    sinopsis: "Un joven y reticente Avatar debe dominar los cuatro elementos para detener a la despiadada Nación del Fuego y restaurar el equilibrio en un mundo devastado por la guerra.",
    director: "M. Night Shyamalan",
    nota: "1.2",
    votos: "180K",
    duracion: "103 min",
    fecha: "2010-07-01",
    generos: ["Acción", "Aventura", "Fantasía"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/6/4/5/5/46455-the-last-airbender-0-1000-0-1500-crop.jpg?v=fbb4ff717f",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 17, 
    titulo: "Disaster Movie", 
    tagline: "Lo llaman comedia, nosotros lo llamamos catástrofe.",
    sinopsis: "Un grupo de jóvenes atractivos intenta sobrevivir a una serie de desastres naturales y ataques de iconos de la cultura pop en una caótica noche en Los Ángeles.",
    director: "Jason Friedberg, Aaron Seltzer",
    nota: "1.4",
    votos: "75K",
    duracion: "87 min",
    fecha: "2008-08-29",
    generos: ["Comedia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/3/5/8/1/43581-disaster-movie-0-1000-0-1500-crop.jpg?v=0ba9d2765a",
    trailer: "https://www.youtube.com/watch?v=QDia3e12czc"
  },
  { 
    id: 18, 
    titulo: "Cats", 
    tagline: "Música. Magia. Memoria.",
    sinopsis: "En una noche trascendental, una tribu de gatos conocida como los Jellicles toma una decisión definitiva sobre qué miembro ascenderá al plano celestial.",
    director: "Tom Hooper",
    nota: "1.5",
    votos: "110K",
    duracion: "110 min",
    fecha: "2019-12-20",
    generos: ["Fantasía", "Musical", "Comedia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/6/5/9/7/8/465978-cats-0-1000-0-1500-crop.jpg?v=586897dd38"
  },
  { 
    id: 19, 
    titulo: "12 Angry Men", 
    tagline: "La vida está en sus manos. La muerte está en sus mentes.",
    sinopsis: "Un jurado compuesto por doce hombres debe decidir el destino de un joven acusado de asesinato en un juicio por homicidio, donde uno de los miembros intenta plantar la duda razonable.",
    director: "Sidney Lumet",
    nota: "4.8",
    votos: "480K",
    duracion: "96 min",
    fecha: "1957-04-10",
    generos: ["Drama"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/5/1/7/0/0/51700-12-angry-men-0-1000-0-1500-crop.jpg?v=b8aaf291a9",
    trailer: "https://www.youtube.com/watch?v=TEN-2uTi2c0"
  },
  { 
    id: 20, 
    titulo: "Harakiri", 
    tagline: "El honor y la tragedia de un samurái.",
    sinopsis: "Durante el Japón feudal, un samurái empobrecido llega a la mansión de un señor feudal solicitando realizar un ritual de suicidio honorable, desenterrando oscuros secretos del clan.",
    director: "Masaki Kobayashi",
    nota: "4.8",
    votos: "130K",
    duracion: "133 min",
    fecha: "1962-09-15",
    generos: ["Acción", "Drama", "Historia"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/4/3/0/1/5/43015-harakiri-0-1000-0-1500-crop.jpg?v=007080a0fb",
    trailer: "https://youtu.be/gfABwM-Ppng"
  },
  { 
    id: 21, 
    titulo: "The Godfather", 
    tagline: "Una oferta que no puedes rechazar.",
    sinopsis: "El patriarca envejecido de una dinastía del crimen organizado en la ciudad de Nueva York transfiere el control de su imperio clandestino a su reacio hijo menor.",
    director: "Francis Ford Coppola",
    nota: "4.7",
    votos: "980K",
    duracion: "175 min",
    fecha: "1972-03-14",
    generos: ["Crimen", "Drama"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/5/1/8/1/8/51818-the-godfather-0-1000-0-1500-crop.jpg?v=bca8b67402",
    trailer: "https://www.youtube.com/watch?v=UaVTIH8mujA"
  },
  { 
    id: 22, 
    titulo: "The Shawshank Redemption", 
    tagline: "La esperanza te hace libre.",
    sinopsis: "Un banquero es condenado a cadena perpetua en la prisión de Shawshank por los asesinatos de su esposa y su amante, donde entabla una amistad transformadora a lo largo de décadas.",
    director: "Frank Darabont",
    nota: "4.7",
    votos: "1.3M",
    duracion: "142 min",
    fecha: "1994-09-23",
    generos: ["Drama", "Crimen"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/sm/upload/7l/hn/46/uz/zGINvGjdlO6TJRu9wESQvWlOKVT-0-1000-0-1500-crop.jpg?v=8736d1c395",
    trailer: "https://www.youtube.com/watch?v=NmzuHjWmXOc"
  },
  { 
    id: 23, 
    titulo: "Come and See", 
    tagline: "Ven y mira los horrores de la guerra.",
    sinopsis: "Un joven bielorruso se une a la resistencia soviética contra las fuerzas nazis durante la Segunda Guerra Mundial, experimentando de primera mano los horrores más brutales del conflicto.",
    director: "Elem Klimov",
    nota: "4.7",
    votos: "190K",
    duracion: "142 min",
    fecha: "1985-10-17",
    generos: ["Drama", "Historia", "Guerra"],
    categoria: "emision", 
    imagen: "https://a.ltrbxd.com/resized/film-poster/3/6/1/9/2/36192-come-and-see-0-1000-0-1500-crop.jpg?v=741b0269bb",
    trailer: "https://www.youtube.com/watch?v=UHaSQU-4wss"
  }
];

function inicializarBaseDeDatos() {
  if (!localStorage.getItem("peliculas")) {
    localStorage.setItem("peliculas", JSON.stringify(peliculasIniciales));
  }
}

function verificarSesionYRol(usuarioActual) {
  const btnAdmin = document.getElementById("btn-admin-agregar");
  const userDisplay = document.getElementById("user-display");

  if (userDisplay && usuarioActual) {
    userDisplay.textContent = usuarioActual.nombre || usuarioActual.username;
  }

  if (btnAdmin) {
    const nombreUsuario = (usuarioActual?.nombre || usuarioActual?.username || "").toLowerCase();
    const esAdmin = usuarioActual?.esAdmin === true || nombreUsuario === "admin";

    if (esAdmin) {
      btnAdmin.style.setProperty("display", "inline-flex", "important");
    } else {
      btnAdmin.style.setProperty("display", "none", "important");
    }
  }
}

function inicializarEventos() {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuarioActual");
      window.location.href = "login.html";
    });
  }

  const formNuevaPelicula = document.getElementById("form-nueva-pelicula");
  if (formNuevaPelicula) {
    formNuevaPelicula.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const inputTrailer = document.getElementById("admin-trailer")?.value.trim();
      const inputDirector = document.getElementById("admin-director")?.value.trim() || "Desconocido";
      const trailerDefault = "https://www.youtube.com/watch?v=QDia3e12czc";

      const nuevaPeli = {
        id: Date.now().toString(),
        titulo: document.getElementById("admin-titulo").value,
        director: inputDirector,
        nota: document.getElementById("admin-nota").value,
        duracion: document.getElementById("admin-duracion").value || "N/A",
        fecha: new Date().toISOString().split("T")[0],
        votos: "1",
        imagen: document.getElementById("admin-imagen").value,
        trailer: trailerDefault || inputTrailer,
        generos: document.getElementById("admin-generos").value.split(",").map(g => g.trim()),
        sinopsis: document.getElementById("admin-sinopsis").value || "Sin sinopsis disponible.",
        categoria: "emision",
        estadoPerfil: "ninguno"
      };

      const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
      peliculas.push(nuevaPeli);
      localStorage.setItem("peliculas", JSON.stringify(peliculas));

      const modalElement = document.getElementById("modalAgregarPelicula");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
      formNuevaPelicula.reset();

      cargarCatalogo();
    });
  }

  const inputSearch = document.getElementById("global-search");
  if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
      const termino = e.target.value.toLowerCase();
      filtrarPorBusqueda(termino);
    });
  }
}

function cargarCatalogo() {
  const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];

  const recomendadas = peliculas.filter(p => parseFloat(p.rating || p.nota) >= 4.5);
  const valoradas = [...peliculas].sort((a, b) => parseFloat(b.rating || b.nota) - parseFloat(a.rating || a.nota));

  const setHtml = (id, lista) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderizarTarjetas(lista);
  };

  setHtml("row-emision", peliculas);
  setHtml("row-recomendadas", recomendadas);
  setHtml("row-valoradas", valoradas);

  const btnActivo = document.querySelector("[id^='btn-filtro-'].active");
  const filtroActual = btnActivo ? btnActivo.id.replace("btn-filtro-", "") : "todas";
  filtrarPerfil(filtroActual);
}

function renderizarTarjetas(lista) {
  if (!lista || lista.length === 0) return `<p class="text-muted small p-2">No hay películas disponibles.</p>`;

  return lista.map(peli => `
    <div class="card bg-transparent border-0 text-white cursor-pointer position-relative card-pelicula" style="width: 160px; flex-shrink: 0;">
      <div class="position-relative overflow-hidden rounded-3 shadow poster-container">
        <img src="${peli.imagen}" class="card-img-top" alt="${peli.titulo}" style="height: 230px; object-fit: cover;" onclick="abrirDetalles('${peli.id}')">
        
        <div class="overlay-hover position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-2 p-2">
          <button class="btn btn-sm ${peli.estadoPerfil === 'vista' ? 'btn-success' : 'btn-outline-success'} w-100 btn-hover-action" onclick="cambiarEstadoPelicula(event, '${peli.id}', 'vista')">
            <i class="bi bi-check-circle-fill"></i> Vista
          </button>
          <button class="btn btn-sm ${peli.estadoPerfil === 'abandonada' ? 'btn-warning text-dark' : 'btn-outline-warning'} w-100 btn-hover-action" onclick="cambiarEstadoPelicula(event, '${peli.id}', 'abandonada')">
            <i class="bi bi-pause-circle-fill"></i> Abandonada
          </button>
          <button class="btn btn-sm ${peli.estadoPerfil === 'no_gusto' ? 'btn-danger' : 'btn-outline-danger'} w-100 btn-hover-action" onclick="cambiarEstadoPelicula(event, '${peli.id}', 'no_gusto')">
            <i class="bi bi-x-circle-fill"></i> No me gustó
          </button>
        </div>
      </div>

      <div class="card-body p-2" onclick="abrirDetalles('${peli.id}')">
        <h6 class="card-title text-truncate mb-1 small fw-bold">${peli.titulo}</h6>
        <div class="d-flex justify-content-between align-items-center extra-small text-muted">
          <span class="text-warning"><i class="bi bi-star-fill"></i> ${peli.rating || peli.nota || 'N/A'}</span>
          <span>${peli.duracion || ''}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function cambiarEstadoPelicula(event, idPelicula, estadoSeleccionado) {
  event.stopPropagation();

  const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
  const index = peliculas.findIndex(p => String(p.id) === String(idPelicula));

  if (index !== -1) {
    if (peliculas[index].estadoPerfil === estadoSeleccionado) {
      peliculas[index].estadoPerfil = "ninguno";
    } else {
      peliculas[index].estadoPerfil = estadoSeleccionado;
    }

    localStorage.setItem("peliculas", JSON.stringify(peliculas));
    cargarCatalogo();
  }
}

function desplazarFila(contenedorId, direccion) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  const distancia = 320;
  contenedor.scrollBy({
    left: direccion === 'izquierda' ? -distancia : distancia,
    behavior: 'smooth'
  });
}

function filtrarPerfil(filtro) {
  const botones = document.querySelectorAll("[id^='btn-filtro-']");
  botones.forEach(btn => btn.classList.remove("active"));
  
  const btnSeleccionado = document.getElementById(`btn-filtro-${filtro}`);
  if (btnSeleccionado) btnSeleccionado.classList.add("active");

  const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
  
  const filtradas = filtro === 'todas' 
    ? peliculas.filter(p => p.estadoPerfil && p.estadoPerfil !== 'ninguno')
    : peliculas.filter(p => p.estadoPerfil === filtro);

  const rowPerfil = document.getElementById("row-perfil");
  const gridPerfilCompleto = document.getElementById("grid-perfil-completo");

  if (rowPerfil) rowPerfil.innerHTML = renderizarTarjetas(filtradas);
  if (gridPerfilCompleto) gridPerfilCompleto.innerHTML = renderizarTarjetas(filtradas);
}

function filtrarPorBusqueda(termino) {
  const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
  const coincidencia = peliculas.filter(p => p.titulo.toLowerCase().includes(termino));

  const rowEmision = document.getElementById("row-emision");
  if (rowEmision) rowEmision.innerHTML = renderizarTarjetas(coincidencia);
}

function abrirDetalles(idPelicula) {
  const peliculas = JSON.parse(localStorage.getItem("peliculas")) || [];
  const peli = peliculas.find(p => String(p.id) === String(idPelicula));

  if (!peli) return;

  document.getElementById("modal-img").src = peli.imagen;
  document.getElementById("modal-titulo").textContent = peli.titulo;
  
  const taglineElem = document.getElementById("modal-tagline");
  if (taglineElem) taglineElem.textContent = peli.tagline || "";

  // Mostrar el director en el modal (asumiendo que tienes un elemento con id "modal-director")
  const directorElem = document.getElementById("modal-director");
  if (directorElem) {
    directorElem.textContent = peli.director || "Desconocido";
  }

  document.getElementById("modal-sinopsis").textContent = peli.sinopsis;
  document.getElementById("modal-fecha").textContent = peli.fecha || "N/A";
  document.getElementById("modal-duracion").textContent = peli.duracion || "N/A";
  document.getElementById("modal-rating").textContent = peli.rating || peli.nota || "N/A";
  document.getElementById("modal-votos").textContent = peli.votos || "0";
  
  const trailerBtn = document.getElementById("modal-trailer-btn");
  if (trailerBtn) trailerBtn.href = peli.trailer || "https://www.youtube.com/watch?v=QDia3e12czc";

  const generosContainer = document.getElementById("modal-generos");
  if (generosContainer && peli.generos) {
    generosContainer.innerHTML = peli.generos
      .map(g => `<span class="badge bg-secondary extra-small">${g}</span>`)
      .join(" ");
  }

  const modalInstance = new bootstrap.Modal(document.getElementById("modalPelicula"));
  modalInstance.show();
}

function showAuthForm(tipo) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");

  if (tipo === "login") {
    loginForm.classList.remove("d-none");
    registerForm.classList.add("d-none");
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    loginForm.classList.add("d-none");
    registerForm.classList.remove("d-none");
    tabLogin.classList.remove("active");
    tabRegister.classList.add("active");
  }
}

document.addEventListener("submit", (e) => {
  if (e.target.id === "login-form") {
    e.preventDefault();
    const nombreInput = document.getElementById("login-username").value;
    const claveInput = document.getElementById("login-password").value;

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioEncontrado = usuarios.find(u => u.nombre === nombreInput && u.clave === claveInput);

    if (usuarioEncontrado) {
      localStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));
      window.location.href = "index.html";
    } else {
      const esAdminDefecto = nombreInput.toLowerCase() === "admin" && claveInput === "admin123";
      const usuario = {
        nombre: nombreInput,
        clave: claveInput,
        esAdmin: esAdminDefecto
      };
      localStorage.setItem("usuarioActual", JSON.stringify(usuario));
      window.location.href = "index.html";
    }
  }

  if (e.target.id === "register-form") {
    e.preventDefault();
    const nombreInput = document.getElementById("reg-username").value;
    const claveInput = document.getElementById("reg-password").value;

    const nuevoUsuario = {
      nombre: nombreInput,
      clave: claveInput,
      esAdmin: nombreInput.toLowerCase() === "admin"
    };

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    localStorage.setItem("usuarioActual", JSON.stringify(nuevoUsuario));
    window.location.href = "index.html";
  }
});