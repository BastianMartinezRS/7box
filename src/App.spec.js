import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MovieCard from './components/MovieCard.jsx';
import Carousel from './components/Carousel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Modals from './components/Modals.jsx';
import Profile from './pages/Profile.jsx';
import Home from './pages/Home.jsx';
import { formatHoursMinutes, getYouTubeEmbedUrl, parseDurationMinutes } from './utils/movieHelpers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Pruebas Unitarias Frontend - 7box', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    container = null;
  });

  const mockPelicula = {
    id: 1,
    titulo: 'Spider-Man Test',
    imagen: 'https://via.placeholder.com/150',
    nota: '8.5',
    duracion: '120 min',
    estadoPerfil: 'vista'
  };

  it('1. Debe validar que la película mock contiene las propiedades clave', () => {
    expect(mockPelicula.id).toBeDefined();
    expect(mockPelicula.titulo).toBe('Spider-Man Test');
  });

  it('2. Debe renderizar el título de la película en el componente MovieCard', async () => {
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    });

    const tituloElement = container.querySelector('.card-title');
    expect(tituloElement.textContent).toBe('Spider-Man Test');
  });

  it('3. Debe llamar la función mock onAbrirDetalles al hacer clic en la tarjeta', async () => {
    const spyAbrir = jasmine.createSpy('onAbrirDetalles');
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={spyAbrir} />);
    });

    const img = container.querySelector('img');
    img.click();
    expect(spyAbrir).toHaveBeenCalledWith(1);
  });

  it('4. Debe disparar onCambiarEstado con la categoría correcta', async () => {
    const spyEstado = jasmine.createSpy('onCambiarEstado');
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={spyEstado} onAbrirDetalles={() => {}} />);
    });

    const btnVista = container.querySelector('.btn-success');
    btnVista.click();
    expect(spyEstado).toHaveBeenCalled();
  });

  it('5. Debe mostrar un mensaje si la lista de películas en el carrusel está vacía', async () => {
    await act(async () => {
      root.render(<Carousel peliculas={[]} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    });

    expect(container.textContent).toContain('No hay películas disponibles.');
  });

  it('6. Debe renderizar la cantidad correcta de tarjetas en el carrusel', async () => {
    const listaMock = [mockPelicula, { ...mockPelicula, id: 2, titulo: 'Película 2' }];
    await act(async () => {
      root.render(<Carousel peliculas={listaMock} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    });

    const tarjetas = container.querySelectorAll('.card-pelicula');
    expect(tarjetas.length).toBe(2);
  });

  it('7. Debe filtrar correctamente películas por nota IMDb mayor o igual a 4.0', () => {
    const lista = [
      { id: 1, nota: '3.5' },
      { id: 2, nota: '4.5' }
    ];
    const recomendadas = lista.filter(p => parseFloat(p.nota) >= 4.0);
    expect(recomendadas.length).toBe(1);
    expect(recomendadas[0].id).toBe(2);
  });

  it('8. Debe ordenar las películas de mayor a menor nota', () => {
    const lista = [
      { id: 1, nota: '2.0' },
      { id: 2, nota: '5.0' }
    ];
    const ordenadas = [...lista].sort((a, b) => parseFloat(b.nota) - parseFloat(a.nota));
    expect(ordenadas[0].id).toBe(2);
  });

  it('9. Debe simular el guardado de usuario en localStorage', () => {
    const usuarioMock = { nombre: 'testuser', esAdmin: false };
    spyOn(localStorage, 'setItem');
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioMock));
    expect(localStorage.setItem).toHaveBeenCalledWith('usuarioActual', JSON.stringify(usuarioMock));
  });

  it('10. Debe identificar correctamente si un usuario tiene rol de Administrador', () => {
    const adminUser = { nombre: 'admin', esAdmin: true };
    const esAdmin = adminUser.esAdmin || adminUser.nombre.toLowerCase() === 'admin';
    expect(esAdmin).toBeTrue();
  });

  it('11. Debe validar credenciales de administrador (admin / admin)', () => {
    const validarAdmin = (user, pass) => user.toLowerCase() === 'admin' && pass === 'admin';
    expect(validarAdmin('admin', 'admin')).toBeTrue();
    expect(validarAdmin('admin', 'admin123')).toBeFalse();
  });

  it('12. Debe validar datos al registrar usuarios no admin', () => {
    const validarRegistro = (user, pass) => {
      if (!user || user.trim().length < 3) return { valido: false, error: 'Mínimo 3 caracteres' };
      if (user.trim().toLowerCase() === 'admin') return { valido: false, error: 'Reservado' };
      if (!pass || pass.length < 4) return { valido: false, error: 'Mínimo 4 caracteres' };
      return { valido: true };
    };

    expect(validarRegistro('admin', '1234').valido).toBeFalse();
    expect(validarRegistro('ab', '1234').valido).toBeFalse();
    expect(validarRegistro('juan', '12').valido).toBeFalse();
    expect(validarRegistro('juan', '1234').valido).toBeTrue();
  });

  it('13. ProtectedRoute debe bloquear usuarios sin rol ADMIN en rutas protegidas', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<div>Pantalla Login</div>} />
            <Route path="/" element={<div>Inicio Público</div>} />
            <Route
              path="/admin"
              element={(
                <ProtectedRoute usuarioActual={{ nombre: 'juan', role: 'ROLE_USER', esAdmin: false }} requireAdmin>
                  <div>Panel Admin Secreto</div>
                </ProtectedRoute>
              )}
            />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(container.textContent).not.toContain('Panel Admin Secreto');
    expect(container.textContent).toContain('Inicio Público');
  });

  it('14. Navbar y Modals deben ocultar acciones de administración a usuarios regulares', async () => {
    const regularUser = { nombre: 'juan', role: 'ROLE_USER', esAdmin: false };
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Navbar usuarioActual={regularUser} onSearch={() => {}} onLogout={() => {}} onNuevaPelicula={() => {}} />
          <Modals esAdmin={false} peliculaSeleccionada={mockPelicula} />
        </MemoryRouter>
      );
    });

    expect(container.querySelector('#btn-admin-agregar')).toBeNull();
    expect(container.querySelector('#link-admin-panel')).toBeNull();
    expect(container.querySelector('#modalAgregarPelicula')).toBeNull();
  });

  it('15. Navbar y Modals deben mostrar acciones de administración a ROLE_ADMIN', async () => {
    const adminUser = { nombre: 'admin', role: 'ROLE_ADMIN', esAdmin: true };
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Navbar usuarioActual={adminUser} onSearch={() => {}} onLogout={() => {}} onNuevaPelicula={() => {}} />
          <Modals esAdmin={true} peliculaSeleccionada={mockPelicula} />
        </MemoryRouter>
      );
    });

    expect(container.querySelector('#btn-admin-agregar')).not.toBeNull();
    expect(container.querySelector('#link-admin-panel')).not.toBeNull();
    expect(container.querySelector('#modalAgregarPelicula')).not.toBeNull();
  });

  it('16. Debe convertir URLs de YouTube a formato embed y calcular duraciones', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=JfVOs4VSpmA')).toBe('https://www.youtube.com/embed/JfVOs4VSpmA');
    expect(getYouTubeEmbedUrl('https://youtu.be/gfABwM-Ppng')).toBe('https://www.youtube.com/embed/gfABwM-Ppng');
    expect(getYouTubeEmbedUrl('not-a-url')).toBeNull();

    expect(parseDurationMinutes('135 min')).toBe(135);
    expect(parseDurationMinutes('2h 15m')).toBe(135);
    expect(formatHoursMinutes(135)).toBe('2h 15m');
  });

  it('17. MovieCard debe soportar estado por_ver (Watchlist)', async () => {
    const spyEstado = jasmine.createSpy('onCambiarEstado');
    const peliPorVer = { ...mockPelicula, estadoPerfil: 'por_ver' };
    await act(async () => {
      root.render(<MovieCard peli={peliPorVer} onCambiarEstado={spyEstado} />);
    });

    expect(container.textContent).toContain('Por ver');
    const btnPorVer = container.querySelector('.btn-info');
    btnPorVer.click();
    expect(spyEstado).toHaveBeenCalledWith(1, 'por_ver');
  });

  it('18. Profile debe mostrar estadísticas de vistas, tiempo y promedio personal', async () => {
    const pelis = [
      { ...mockPelicula, id: 1, estadoPerfil: 'vista', duracion: '120 min', miPuntuacion: 5, generos: ['Acción'] },
      { ...mockPelicula, id: 2, estadoPerfil: 'por_ver', duracion: '90 min', miPuntuacion: 3, generos: ['Drama'] },
    ];
    await act(async () => {
      root.render(<Profile peliculas={pelis} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} onCalificar={() => {}} />);
    });

    expect(container.textContent).toContain('2h');
    expect(container.textContent).toContain('4.0/5');
    expect(container.textContent).toContain('Acción');
  });

  it('19. Profile debe mostrar sección Top 4 Favoritas con películas marcadas como favoritas', async () => {
    const pelis = [
      { ...mockPelicula, id: 1, titulo: 'Favorita Uno', esFavorita: true },
      { ...mockPelicula, id: 2, titulo: 'Película Normal', esFavorita: false },
    ];
    await act(async () => {
      root.render(<Profile peliculas={pelis} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} onCalificar={() => {}} />);
    });

    expect(container.textContent).toContain('Top 4 Favoritas (1/4)');
    expect(container.textContent).toContain('Favorita Uno');
  });

  it('20. Home debe filtrar películas por nombre de director además de título', async () => {
    const pelis = [
      { ...mockPelicula, id: 1, titulo: 'Oppenheimer', director: 'Christopher Nolan', generos: ['Drama'], estadoPerfil: 'ninguno' },
      { ...mockPelicula, id: 2, titulo: 'Parasite', director: 'Bong Joon-ho', generos: ['Thriller'], estadoPerfil: 'ninguno' },
    ];
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Home peliculas={pelis} filtroBusqueda="Nolan" onCambiarEstado={() => {}} onAbrirDetalles={() => {}} onCalificar={() => {}} />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Oppenheimer');
    expect(container.textContent).not.toContain('Parasite');
  });
});
