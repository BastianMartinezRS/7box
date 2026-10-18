import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';

export default function Profile({ peliculas, onCambiarEstado, onAbrirDetalles, onCalificar }) {
  const [filtro, setFiltro] = useState('todas');

  const peliculasPerfil = peliculas.filter(p => {
    if (!p.estadoPerfil || p.estadoPerfil === 'ninguno') return false;
    if (filtro === 'todas') return true;
    return p.estadoPerfil === filtro;
  });

  return (
    <div className="container-fluid py-4 px-3 px-md-4 mb-5">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3 flex-wrap gap-3">
        <h3 className="fw-bold mb-0"><i className="bi bi-collection-play text-primary"></i> Mi Colección Completa</h3>
        
        <div className="btn-group btn-group-sm flex-wrap">
          <button className={`btn btn-outline-light ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>Todas</button>
          <button className={`btn btn-outline-success ${filtro === 'vista' ? 'active' : ''}`} onClick={() => setFiltro('vista')}>Vistas</button>
          <button className={`btn btn-outline-warning ${filtro === 'abandonada' ? 'active' : ''}`} onClick={() => setFiltro('abandonada')}>Abandonadas</button>
          <button className={`btn btn-outline-danger ${filtro === 'no_gusto' ? 'active' : ''}`} onClick={() => setFiltro('no_gusto')}>No me gustaron</button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3">
        {peliculasPerfil.length === 0 ? (
          <p className="text-muted w-100 text-center mt-5">Aún no has clasificado películas en esta categoría.</p>
        ) : (
          peliculasPerfil.map(peli => (
            <MovieCard key={peli.id} peli={peli} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
          ))
        )}
      </div>
    </div>
  );
}