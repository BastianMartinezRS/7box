import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import MovieCard from '../components/MovieCard';

export default function Home({ peliculas, filtroBusqueda, onCambiarEstado, onAbrirDetalles, onCalificar }) {
  const [filtroPerfil, setFiltroPerfil] = useState('todas');

  // Filtrar catálogo por término de búsqueda
  const peliculasFiltradas = peliculas.filter(p => 
    p.titulo.toLowerCase().includes(filtroBusqueda.toLowerCase())
  );

  // Listas calculadas
  const recomendadas = peliculasFiltradas.filter(p => parseFloat(p.rating || p.nota) >= 4.0);
  const mejorValoradas = [...peliculasFiltradas].sort((a, b) => parseFloat(b.rating || b.nota) - parseFloat(a.rating || a.nota));

  // Lista de mi perfil
  const peliculasPerfil = peliculas.filter(p => {
    if (!p.estadoPerfil || p.estadoPerfil === 'ninguno') return false;
    if (filtroPerfil === 'todas') return true;
    return p.estadoPerfil === filtroPerfil;
  });

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <div className="text-center my-3">
        <h1 className="fw-bold fs-2 fs-md-1">¡Bienvenido a 7box!</h1>
        <p className="text-muted small">Haz clic sobre un póster para ver toda su información detallada.</p>
      </div>

      {/* CATÁLOGO PRINCIPAL */}
      <section className="mb-5">
        <h4 className="text-primary fw-bold mb-3 px-2">Catálogo</h4>
        <Carousel peliculas={peliculasFiltradas} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
      </section>

      {/* RECOMENDADAS */}
      <section className="mb-5">
        <h4 className="text-primary fw-bold mb-3 px-2">Recomendadas Para Ti</h4>
        <Carousel peliculas={recomendadas} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
      </section>

      {/* MEJOR VALORADAS */}
      <section className="mb-5">
        <h4 className="text-primary fw-bold mb-3 px-2">Mejor Valoradas</h4>
        <Carousel peliculas={mejorValoradas} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
      </section>

      <hr className="border-secondary my-4" />

      {/* SECCIÓN MI PERFIL */}
      <section>
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0"><i className="bi bi-bookmark-fill text-primary"></i> Mi Perfil</h5>
            <Link to="/perfil" className="btn btn-sm btn-success text-dark fw-bold">
              Ver todo <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div className="btn-group btn-group-sm flex-wrap">
            <button className={`btn btn-outline-light ${filtroPerfil === 'todas' ? 'active' : ''}`} onClick={() => setFiltroPerfil('todas')}>Todas</button>
            <button className={`btn btn-outline-success ${filtroPerfil === 'vista' ? 'active' : ''}`} onClick={() => setFiltroPerfil('vista')}>Vistas</button>
            <button className={`btn btn-outline-warning ${filtroPerfil === 'abandonada' ? 'active' : ''}`} onClick={() => setFiltroPerfil('abandonada')}>Abandonadas</button>
            <button className={`btn btn-outline-danger ${filtroPerfil === 'no_gusto' ? 'active' : ''}`} onClick={() => setFiltroPerfil('no_gusto')}>No me gustaron</button>
          </div>
        </div>
        
        <div className="d-flex flex-wrap gap-3">
          {peliculasPerfil.length === 0 ? (
            <p className="text-muted small">No hay películas en esta categoría.</p>
          ) : (
            peliculasPerfil.map(peli => (
              <MovieCard key={peli.id} peli={peli} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}