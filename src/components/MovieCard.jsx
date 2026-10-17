import React from 'react';

export default function MovieCard({ peli, onCambiarEstado, onAbrirDetalles }) {
  const handleEstado = (e, estado) => {
    e.stopPropagation();
    onCambiarEstado(peli.id, estado);
  };

  return (
    <div className="card bg-transparent border-0 text-white cursor-pointer position-relative card-pelicula" style={{ width: '160px', flexShrink: 0 }}>
      <div className="position-relative overflow-hidden rounded-3 shadow poster-container">
        <img 
          src={peli.imagen} 
          className="card-img-top" 
          alt={peli.titulo} 
          style={{ height: '230px', objectFit: 'cover' }} 
          onClick={() => onAbrirDetalles(peli.id)}
        />
        
        <div className="overlay-hover position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-2 p-2">
          <button 
            className={`btn btn-sm w-100 btn-hover-action ${peli.estadoPerfil === 'vista' ? 'btn-success' : 'btn-outline-success'}`} 
            onClick={(e) => handleEstado(e, 'vista')}
          >
            <i className="bi bi-check-circle-fill"></i> Vista
          </button>
          <button 
            className={`btn btn-sm w-100 btn-hover-action ${peli.estadoPerfil === 'abandonada' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} 
            onClick={(e) => handleEstado(e, 'abandonada')}
          >
            <i className="bi bi-pause-circle-fill"></i> Abandonada
          </button>
          <button 
            className={`btn btn-sm w-100 btn-hover-action ${peli.estadoPerfil === 'no_gusto' ? 'btn-danger' : 'btn-outline-danger'}`} 
            onClick={(e) => handleEstado(e, 'no_gusto')}
          >
            <i className="bi bi-x-circle-fill"></i> No me gustó
          </button>
        </div>
      </div>

      <div className="card-body p-2" onClick={() => onAbrirDetalles(peli.id)}>
        <h6 className="card-title text-truncate mb-1 small fw-bold">{peli.titulo}</h6>
        <div className="d-flex justify-content-between align-items-center extra-small text-muted">
          <span className="text-warning"><i className="bi bi-star-fill"></i> {peli.rating || peli.nota || 'N/A'}</span>
          <span>{peli.duracion || ''}</span>
        </div>
      </div>
    </div>
  );
}