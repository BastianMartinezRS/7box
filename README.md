# 🎬 7box

> Aplicación web responsiva (Single Page Application) para explorar películas, consultar detalles, ver tráilers y gestionar una colección cinematográfica personal con calificaciones y listas personalizadas.

---

## ✨ Características Principales

- **Catálogo Dinámico Full-Width:** Carruseles horizontales adaptados al ancho completo de la pantalla con desplazamiento fluido para películas en emisión, recomendadas y mejor valoradas.
- **Detalles y Tráilers:** Modales interactivos con sinopsis, notas IMDb, duración, géneros, ficha técnica y enlace directo a tráilers en YouTube.
- **Colección Personal (Mi Perfil):** Clasificación de películas en listas personalizadas:
  -  *Vistas*
  - ⏸️ *Abandonadas*
  - ❌ *No me gustaron*
- **Sistema de Calificación Personal:** Puntuación interactiva de 1 a 5 estrellas independiente de la nota de catálogo/IMDb.
- **Buscador en Tiempo Real:** Filtrado instantáneo de películas integrado en la barra de navegación.
- **Panel de Administrador:** Formulario para agregar nuevas películas al catálogo con imagen, tráiler, sinopsis y ficha técnica (exclusivo para el usuario `admin`).
- **Persistencia de Datos (`localStorage`):** Guarda usuarios registrados, sesión activa, modificaciones del catálogo, listas personales y puntuaciones sin depender de una base de datos externa.
- **Sistema de Autenticación y Validación:**
  - Acceso administrador verificado (`admin` / `admin`).
  - Registro de usuarios regulares con validaciones de longitud, caracteres permitidos y prevención de nombres duplicados.

---

## 🛠️ Tecnologías

### Frontend & UI
- **[React](https://react.dev/):** Componentes funcionales y React Hooks (`useState`, `useEffect`, `useRef`).
- **[Vite](https://vitejs.dev/):** Entorno de desarrollo rápido y empaquetador para producción.
- **[React Router DOM](https://reactrouter.com/):** Enrutamiento declarativo para Single Page Applications (SPA).
- **[Bootstrap 5](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/):** Sistema de maquetación responsivo y componentes de interfaz.
- **CSS3 Personalizado:** Tema oscuro neón con acentos verdes (`#38ef7d`), animaciones sutiles y diseño adaptable.

### Testing & Calidad de Código
- **[Jasmine](https://jasmine.github.io/):** Framework de pruebas unitarias y aserciones BDD.
- **[Karma](https://karma-runner.github.io/):** Test runner configurado con `ChromeHeadless` para pruebas automatizadas.
- **[Webpack](https://webpack.js.org/) & [Babel](https://babeljs.io/):** Transpilación y empaquetado de JSX para el entorno de pruebas.
- **[Karma Coverage](https://github.com/karma-runner/karma-coverage):** Generación de reportes de cobertura de código.
- **[Oxlint](https://oxc.rs/):** Linter de alto rendimiento para validación estática de JavaScript.

---

## 🔑 Credenciales de Prueba

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin` | Acceso completo + Agregar nuevas películas al catálogo |
| **Usuario Regular** | *Registrable* | *Mínimo 4 caracteres* | Exploración, Mi Perfil, listas personales y puntuaciones |

> 💡 Puedes registrar cualquier usuario no administrador desde la pestaña **"Registrarse"** en la pantalla de inicio de sesión.

---

## 📂 Estructura del Proyecto

```text
7box/
├── coverage/               # Reportes generados de cobertura de pruebas
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/             # Recursos multimedia y assets
│   ├── components/         # Componentes reutilizables
│   │   ├── Carousel.jsx    # Carrusel horizontal con scroll dinámico
│   │   ├── Modals.jsx      # Modales de detalle y formulario de nueva película
│   │   ├── MovieCard.jsx   # Tarjeta de película con acciones rápidas y estrellas
│   │   └── Navbar.jsx      # Barra de navegación con buscador y enlaces
│   ├── data/
│   │   └── peliculas.js    # Catálogo inicial de películas precargadas
│   ├── pages/              # Vistas principales de la aplicación
│   │   ├── Home.jsx        # Catálogo general y resumen de perfil
│   │   ├── Login.jsx       # Pantalla de inicio de sesión y registro
│   │   └── Profile.jsx     # Colección completa y filtros de usuario
│   ├── App.jsx             # Estados globales, persistencia y enrutador
│   ├── App.spec.js         # Suite de pruebas unitarias en Jasmine
│   ├── index.css           # Reseteo y layout general full-width
│   ├── main.jsx            # Punto de entrada de React en el DOM
│   └── styles.css          # Estilos del tema oscuro, colores y carruseles
├── index.html              # Plantilla HTML base
├── karma.conf.cjs          # Configuración de Karma y Webpack
├── package.json            # Dependencias y scripts del proyecto
└── vite.config.js          # Configuración del servidor y plugins de Vite
```

---

## 🚀 Instalación y Uso

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/BastianMartinezRS/7box.git
cd 7box
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 3. Ejecutar las pruebas unitarias
```bash
npm test
```
Ejecuta la suite de **12 pruebas unitarias** con Jasmine y Karma en `ChromeHeadless` generando el reporte de cobertura en la carpeta `coverage/`.

### 4. Compilar para producción
```bash
npm run build
```

### 5. Verificar calidad de código (Lint)
```bash
npm run lint
```

---

## 🧪 Pruebas Unitarias Automatizadas

El archivo [`src/App.spec.js`](src/App.spec.js) valida automáticamente la lógica central de la aplicación:

1. Estructura y propiedades clave del modelo de película.
2. Renderizado correcto del título en el componente `MovieCard`.
3. Disparo de eventos al interactuar y abrir detalles (`jasmine.createSpy`).
4. Cambio de categoría de perfil (*Vista, Abandonada, No me gustó*).
5. Mensaje informativo ante listas de carrusel vacías.
6. Renderizado de la cantidad exacta de tarjetas en el carrusel.
7. Filtrado de películas recomendadas (calificación IMDb >= 4.0).
8. Ordenamiento de catálogo de mayor a menor nota.
9. Simulación de guardado de sesión en `localStorage` con `spyOn`.
10. Comprobación y asignación del rol de Administrador.
11. Validación de credenciales de administrador (`admin` / `admin`).
12. Validación de reglas de registro de usuarios regulares.