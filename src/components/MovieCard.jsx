import React, { useState } from 'react';
import { handlePosterError } from '../utils/movieHelpers';

const ESTADO_BADGES = {
  vista: { cls: 'bg-success', icon: 'bi-check-circle-fill', label: 'Vista' },
  por_ver: { cls: 'bg-info text-dark', icon: 'bi-bookmark-plus-fill', label: 'Por ver' },
  abandonada: { cls: 'bg-warning text-dark', icon: 'bi-pause-circle-fill', label: 'Aband.' },
  no_gusto: { cls: 'bg-danger', icon: 'bi-x-circle-fill', label: 'No gustó' },
};

export default function MovieCard({ peli, onCambiarEstado = () => {}, onAbrirDetalles = () => {}, onCalificar = () => {} }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleEstado = (e, estado) => {
    e.stopPropagation();
    onCambiarEstado(peli.id, estado);
  };

  const handlePuntuar = (e, puntuacion) => {
    e.stopPropagation();
    onCalificar(peli.id, puntuacion);
  };

  const badgeInfo = peli.estadoPerfil && peli.estadoPerfil !== 'ninguno' ? ESTADO_BADGES[peli.estadoPerfil] : null;

  return (
    <div className="card bg-transparent border-0 text-white position-relative card-pelicula" style={{ width: '168px', flexShrink: 0 }}>
      {/* PÓSTER CON BADGES Y OVERLAY */}
      <div
        className="position-relative overflow-hidden rounded-3 shadow poster-container cursor-pointer"
        onClick={() => onAbrirDetalles(peli.id)}
      >
        {/* Badge de puntuación personal si fue calificada */}
        {peli.miPuntuacion && (
          <span
            className="badge bg-warning text-dark position-absolute top-0 start-0 m-2 shadow-sm z-2 fw-bold"
            style={{ fontSize: '10px' }}
            title={`Tu puntuación: ${peli.miPuntuacion}/5`}
          >
            <i className="bi bi-star-fill"></i> Mi nota: {peli.miPuntuacion}
          </span>
        )}

        {/* Badge de estado si está marcado */}
        {badgeInfo && (
          <span
            className={`badge position-absolute top-0 end-0 m-2 shadow-sm z-2 ${badgeInfo.cls}`}
            style={{ fontSize: '10px' }}
          >
            <i className={`bi ${badgeInfo.icon}`}></i> {badgeInfo.label}
          </span>
        )}

        <img
          src={peli.imagen}
          className="card-img-top"
          alt={peli.titulo}
          style={{ height: '230px', objectFit: 'cover' }}
          onError={handlePosterError}
          onClick={(e) => {
            e.stopPropagation();
            onAbrirDetalles(peli.id);
          }}
        />

        {/* Overlay hover para computadoras de escritorio */}
        <div
          className="overlay-hover position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center gap-1 p-2"
          onClick={() => onAbrirDetalles(peli.id)}
        >
          <span className="text-white-50 extra-small fw-bold mb-1">Cambiar estado:</span>
          <button
            className={`btn btn-sm w-100 btn-hover-action ${peli.estadoPerfil === 'vista' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={(e) => handleEstado(e, 'vista')}
          >
            <i className="bi bi-check-circle-fill"></i> Vista
          </button>
          <button
            className={`btn btn-sm w-100 btn-hover-action ${peli.estadoPerfil === 'por_ver' ? 'btn-info text-dark' : 'btn-outline-info'}`}
            onClick={(e) => handleEstado(e, 'por_ver')}
          >
            <i className="bi bi-bookmark-plus-fill"></i> Por ver
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

      {/* CUERPO DE LA TARJETA */}
      <div className="card-body p-2 d-flex flex-column">
        {/* Título de la película */}
        <h6
          className="card-title text-truncate mb-1 small fw-bold cursor-pointer"
          title={peli.titulo}
          onClick={() => onAbrirDetalles(peli.id)}
        >
          {peli.titulo}
        </h6>

        {/* Puntuación por defecto (catálogo / IMDb) y duración */}
        <div
          className="d-flex justify-content-between align-items-center extra-small text-muted mb-2 cursor-pointer"
          onClick={() => onAbrirDetalles(peli.id)}
        >
          <span className="text-warning">
            <i className="bi bi-star-fill"></i> {peli.rating || peli.nota || 'N/A'}{' '}
            <span className="text-secondary opacity-75" style={{ fontSize: '9px' }}>(Catálogo)</span>
          </span>
          <span>{peli.duracion || ''}</span>
        </div>

        {/* PUNTUACIÓN PERSONAL (DISTINTA A LA POR DEFECTO) */}
        <div
          className="puntuacion-personal-box p-1 rounded mb-2 bg-dark bg-opacity-75 border border-secondary border-opacity-25"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d-flex justify-content-between align-items-center mb-1 px-1">
            <span className="text-light fw-bold" style={{ fontSize: '10px' }}>Mi Puntuación:</span>
            <span className="text-warning fw-bold" style={{ fontSize: '11px' }}>
              {peli.miPuntuacion ? `★ ${peli.miPuntuacion}/5` : <span className="text-muted" style={{ fontSize: '9px' }}>Sin puntuar</span>}
            </span>
          </div>
          <div className="d-flex justify-content-center gap-1 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${star <= (hoverRating || peli.miPuntuacion || 0) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} cursor-pointer`}
                style={{ fontSize: '14px' }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={(e) => handlePuntuar(e, star)}
                title={`Puntuar con ${star} estrella${star > 1 ? 's' : ''}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
