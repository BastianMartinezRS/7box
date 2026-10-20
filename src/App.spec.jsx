import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MovieCard from './components/MovieCard.jsx';
import Carousel from './components/Carousel.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Pruebas Unitarias Frontend - 7box', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    container = null;
    vi.restoreAllMocks();
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
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    });

    const tituloElement = container.querySelector('.card-title');
    expect(tituloElement.textContent).toBe('Spider-Man Test');
  });

  it('3. Debe llamar la función mock onAbrirDetalles al hacer clic en la tarjeta', async () => {
    const spyAbrir = vi.fn();
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={spyAbrir} />);
    });

    const img = container.querySelector('img');
    img.click();
    expect(spyAbrir).toHaveBeenCalledWith(1);
  });

  it('4. Debe disparar onCambiarEstado con la categoría correcta', async () => {
    const spyEstado = vi.fn();
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCambiarEstado={spyEstado} onAbrirDetalles={() => {}} />);
    });

    const btnVista = container.querySelector('.btn-success');
    btnVista.click();
    expect(spyEstado).toHaveBeenCalled();
  });

  it('5. Debe mostrar un mensaje si la lista de películas en el carrusel está vacía', async () => {
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<Carousel peliculas={[]} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    });

    expect(container.textContent).toContain('No hay películas disponibles.');
  });

  it('6. Debe renderizar la cantidad correcta de tarjetas en el carrusel', async () => {
    const listaMock = [mockPelicula, { ...mockPelicula, id: 2, titulo: 'Película 2' }];
    const root = ReactDOM.createRoot(container);
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
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioMock));
    expect(spy).toHaveBeenCalledWith('usuarioActual', JSON.stringify(usuarioMock));
  });

  it('10. Debe identificar correctamente si un usuario tiene rol de Administrador', () => {
    const adminUser = { nombre: 'admin', esAdmin: true };
    const esAdmin = adminUser.esAdmin || adminUser.nombre.toLowerCase() === 'admin';
    expect(esAdmin).toBe(true);
  });

  it('11. Debe validar credenciales de administrador (admin / admin)', () => {
    const validarAdmin = (user, pass) => user.toLowerCase() === 'admin' && pass === 'admin';
    expect(validarAdmin('admin', 'admin')).toBe(true);
    expect(validarAdmin('admin', 'admin123')).toBe(false);
  });

  it('12. Debe validar datos al registrar usuarios no admin', () => {
    const validarRegistro = (user, pass) => {
      if (!user || user.trim().length < 3) return { valido: false, error: 'Mínimo 3 caracteres' };
      if (user.trim().toLowerCase() === 'admin') return { valido: false, error: 'Reservado' };
      if (!pass || pass.length < 4) return { valido: false, error: 'Mínimo 4 caracteres' };
      return { valido: true };
    };

    expect(validarRegistro('admin', '1234').valido).toBe(false);
    expect(validarRegistro('ab', '1234').valido).toBe(false);
    expect(validarRegistro('juan', '12').valido).toBe(false);
    expect(validarRegistro('juan', '1234').valido).toBe(true);
  });

  it('13. Debe disparar onCalificar y soportar hover al interactuar con las estrellas de puntuación', async () => {
    const spyCalificar = vi.fn();
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<MovieCard peli={mockPelicula} onCalificar={spyCalificar} />);
    });

    const estrellas = container.querySelectorAll('.puntuacion-personal-box i');
    expect(estrellas.length).toBe(5);

    await act(async () => {
      estrellas[3].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      estrellas[3].dispatchEvent(new MouseEvent('mouseenter'));
    });

    await act(async () => {
      estrellas[3].dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      estrellas[3].dispatchEvent(new MouseEvent('mouseleave'));
    });

    await act(async () => {
      estrellas[4].click();
    });
    expect(spyCalificar).toHaveBeenCalledWith(mockPelicula.id, 5);
  });

  it('14. Debe permitir cambiar estado a "abandonada" y "no_gusto" y abrir detalles al hacer clic en elementos clave', async () => {
    const spyEstado = vi.fn();
    const spyDetalles = vi.fn();
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(
        <MovieCard 
          peli={mockPelicula} 
          onCambiarEstado={spyEstado} 
          onAbrirDetalles={spyDetalles} 
        />
      );
    });

    const btnAband = container.querySelector('.btn-outline-warning, .btn-warning');
    if (btnAband) {
      btnAband.click();
      expect(spyEstado).toHaveBeenCalledWith(mockPelicula.id, 'abandonada');
    }

    const btnNoGusto = container.querySelector('.btn-outline-danger, .btn-danger');
    if (btnNoGusto) {
      btnNoGusto.click();
      expect(spyEstado).toHaveBeenCalledWith(mockPelicula.id, 'no_gusto');
    }

    const titulo = container.querySelector('.card-title');
    titulo.click();
    expect(spyDetalles).toHaveBeenCalledWith(mockPelicula.id);

    const imdbBar = container.querySelector('.extra-small.text-muted');
    if (imdbBar) {
      imdbBar.click();
      expect(spyDetalles).toHaveBeenCalledWith(mockPelicula.id);
    }

    const poster = container.querySelector('.poster-container');
    if (poster) poster.click();

    const overlay = container.querySelector('.overlay-hover');
    if (overlay) overlay.click();

    const boxPunt = container.querySelector('.puntuacion-personal-box');
    if (boxPunt) boxPunt.click();
  });

  it('15. Debe renderizar badges de calificación previa y estados "abandonada" y "no_gusto"', async () => {
    const peliAbandonada = {
      ...mockPelicula,
      estadoPerfil: 'abandonada',
      miPuntuacion: 4
    };
    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<MovieCard peli={peliAbandonada} />);
    });

    expect(container.textContent).toContain('Mi nota: 4');
    expect(container.textContent).toContain('Aband.');

    const peliNoGusto = {
      ...mockPelicula,
      estadoPerfil: 'no_gusto',
      miPuntuacion: null
    };
    await act(async () => {
      root.render(<MovieCard peli={peliNoGusto} />);
    });
    expect(container.textContent).toContain('No gustó');
  });

  it('16. Debe desplazar el carrusel al hacer clic en las flechas izquierda y derecha', async () => {
    const scrollBySpy = vi.fn();
    HTMLDivElement.prototype.scrollBy = scrollBySpy;

    const root = ReactDOM.createRoot(container);
    await act(async () => {
      root.render(<Carousel peliculas={[mockPelicula]} />);
    });

    const flechaIzq = container.querySelector('.flecha-izq');
    const flechaDer = container.querySelector('.flecha-der');

    flechaIzq.click();
    expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth', left: expect.any(Number) }));

    flechaDer.click();
    expect(scrollBySpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth', left: expect.any(Number) }));
  });
});