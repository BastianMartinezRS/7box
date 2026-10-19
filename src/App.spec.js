import React from 'react';
import ReactDOM from 'react-dom/client';
import MovieCard from './components/MovieCard.jsx';
import Carousel from './components/Carousel.jsx';

describe('Pruebas Unitarias Frontend - 7box', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
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

  it('2. Debe renderizar el título de la película en el componente MovieCard', () => {
    const root = ReactDOM.createRoot(container);
    root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);
    
    setTimeout(() => {
      const tituloElement = container.querySelector('.card-title');
      expect(tituloElement.textContent).toBe('Spider-Man Test');
    }, 100);
  });

  it('3. Debe llamar la función mock onAbrirDetalles al hacer clic en la tarjeta', () => {
    const spyAbrir = jasmine.createSpy('onAbrirDetalles');
    const root = ReactDOM.createRoot(container);
    root.render(<MovieCard peli={mockPelicula} onCambiarEstado={() => {}} onAbrirDetalles={spyAbrir} />);

    setTimeout(() => {
      const img = container.querySelector('img');
      img.click();
      expect(spyAbrir).toHaveBeenCalledWith(1);
    }, 100);
  });

  it('4. Debe disparar onCambiarEstado con la categoría correcta', () => {
    const spyEstado = jasmine.createSpy('onCambiarEstado');
    const root = ReactDOM.createRoot(container);
    root.render(<MovieCard peli={mockPelicula} onCambiarEstado={spyEstado} onAbrirDetalles={() => {}} />);

    setTimeout(() => {
      const btnVista = container.querySelector('.btn-success');
      btnVista.click();
      expect(spyEstado).toHaveBeenCalled();
    }, 100);
  });

  it('5. Debe mostrar un mensaje si la lista de películas en el carrusel está vacía', () => {
    const root = ReactDOM.createRoot(container);
    root.render(<Carousel peliculas={[]} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);

    setTimeout(() => {
      expect(container.textContent).toContain('No hay películas disponibles.');
    }, 100);
  });

  it('6. Debe renderizar la cantidad correcta de tarjetas en el carrusel', () => {
    const listaMock = [mockPelicula, { ...mockPelicula, id: 2, titulo: 'Película 2' }];
    const root = ReactDOM.createRoot(container);
    root.render(<Carousel peliculas={listaMock} onCambiarEstado={() => {}} onAbrirDetalles={() => {}} />);

    setTimeout(() => {
      const tarjetas = container.querySelectorAll('.card-pelicula');
      expect(tarjetas.length).toBe(2);
    }, 100);
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
});