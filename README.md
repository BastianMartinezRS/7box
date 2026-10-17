7box
7box es una aplicación web responsiva (Single Page Application) para explorar películas, ver detalles y gestionar una colección personal de cine.

Características
Catálogo: Explora listas de películas en emisión, recomendadas y mejor valoradas mediante carruseles dinámicos.

Detalles y Tráiler: Revisa sinopsis, nota IMDb, duración y acceso al tráiler en YouTube a través de modales.

Colección Personal: Clasifica y filtra películas por estado (Vistas, Abandonadas, No me gustaron) en tu perfil.

Búsqueda: Buscador global en tiempo real integrado en la barra de navegación.

Panel Administrador: Formulario para agregar nuevos títulos al catálogo (accesible ingresando con el usuario admin).

Diseño Responsivo: Interfaz adaptada a móviles, tablets y escritorio usando Bootstrap.

Tecnologías
React (Componentes funcionales y Hooks)

Vite (Entorno de desarrollo y construcción)

React Router DOM (Enrutamiento de la SPA)

Bootstrap 5 & Bootstrap Icons (Estilos y componentes UI)

JavaScript (ES6+) / JSX

Estructura del Proyecto:

├── public/                 # Archivos estáticos
├── src/                    # Código fuente de React
│   ├── components/         # Componentes reutilizables (Navbar, MovieCard, Carousel, Modals)
│   ├── data/               # Datos iniciales (peliculas.js)
│   ├── pages/              # Vistas principales (Home, Login, Profile)
│   ├── App.jsx             # Enrutador y estados globales
│   ├── main.jsx            # Punto de entrada de la aplicación
│   └── index.css           # Estilos globales personalizados
├── index.html              # Plantilla HTML principal
├── package.json            # Dependencias y scripts
└── vite.config.js          # Configuración de Vite