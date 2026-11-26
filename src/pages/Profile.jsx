import React, { useMemo, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { formatHoursMinutes, parseDurationMinutes } from '../utils/movieHelpers';

export default function Profile({ peliculas, onCambiarEstado, onAbrirDetalles, onCalificar }) {
  const [filtro, setFiltro] = useState('todas');

  const favoritas = useMemo(
    () => peliculas.filter((p) => p.esFavorita === true).slice(0, 4),
    [peliculas]
  );

  const stats = useMemo(() => {
    const vistas = peliculas.filter((p) => p.estadoPerfil === 'vista');
    const porVer = peliculas.filter((p) => p.estadoPerfil === 'por_ver');
    const calificadas = peliculas.filter((p) => typeof p.miPuntuacion === 'number' && p.miPuntuacion > 0);

    const promedioPersonal = calificadas.length > 0
      ? (calificadas.reduce((acc, p) => acc + p.miPuntuacion, 0) / calificadas.length).toFixed(1)
      : null;

    const minutosVistos = vistas.reduce((acc, p) => acc + parseDurationMinutes(p.duracion), 0);

    const conteoGeneros = {};
    const fuenteGeneros = vistas.length > 0 ? vistas : peliculas.filter((p) => p.estadoPerfil && p.estadoPerfil !== 'ninguno');
    fuenteGeneros.forEach((p) => {
      if (Array.isArray(p.generos)) {
        p.generos.forEach((g) => {
          const limpio = (g || '').trim();
          if (limpio) {
            conteoGeneros[limpio] = (conteoGeneros[limpio] || 0) + 1;
          }
        });
      }
    });

    const generoFavorito = Object.entries(conteoGeneros).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos';

    return {
      totalVistas: vistas.length,
      totalPorVer: porVer.length,
      promedioPersonal,
      tiempoVisto: formatHoursMinutes(minutosVistos),
      generoFavorito,
    };
  }, [peliculas]);

  const peliculasPerfil = peliculas.filter((p) => {
    if (!p.estadoPerfil || p.estadoPerfil === 'ninguno') return false;
    if (filtro === 'todas') return true;
    return p.estadoPerfil === filtro;
  });

  return (
    <div className="container-fluid py-4 px-2 px-sm-3 px-md-4 mb-5">
      <div className="d-flex align-items-start align-items-md-center justify-content-between mb-4 border-bottom border-secondary pb-3 flex-column flex-md-row gap-3">
        <h3 className="fw-bold mb-0"><i className="bi bi-collection-play text-primary"></i> Mi Colección Completa</h3>

        <div className="d-flex flex-wrap gap-1">
          <button className={`btn btn-sm btn-outline-light ${filtro === 'todas' ? 'active' : ''}`} onClick={() => setFiltro('todas')}>Todas</button>
          <button className={`btn btn-sm btn-outline-success ${filtro === 'vista' ? 'active' : ''}`} onClick={() => setFiltro('vista')}>Vistas</button>
          <button className={`btn btn-sm btn-outline-info ${filtro === 'por_ver' ? 'active' : ''}`} onClick={() => setFiltro('por_ver')}>Por ver</button>
          <button className={`btn btn-sm btn-outline-warning ${filtro === 'abandonada' ? 'active' : ''}`} onClick={() => setFiltro('abandonada')}>Abandonadas</button>
          <button className={`btn btn-sm btn-outline-danger ${filtro === 'no_gusto' ? 'active' : ''}`} onClick={() => setFiltro('no_gusto')}>No me gustaron</button>
        </div>
      </div>

      {/* ESTADÍSTICAS PERSONALES */}
      <div className="row g-2 g-sm-3 mb-4">
        <div className="col-6 col-md-3 col-lg">
          <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
            <small className="text-muted d-block mb-1">Vistas</small>
            <span className="fs-4 fw-bold text-success">{stats.totalVistas}</span>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg">
          <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
            <small className="text-muted d-block mb-1">Por ver (Watchlist)</small>
            <span className="fs-4 fw-bold text-info">{stats.totalPorVer}</span>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg">
          <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
            <small className="text-muted d-block mb-1">Tiempo visto</small>
            <span className="fs-4 fw-bold text-white">{stats.tiempoVisto}</span>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg">
          <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
            <small className="text-muted d-block mb-1">Tu promedio</small>
            <span className="fs-4 fw-bold text-warning">
              {stats.promedioPersonal ? `★ ${stats.promedioPersonal}/5` : 'Sin notas'}
            </span>
          </div>
        </div>
        <div className="col-12 col-lg">
          <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
            <small className="text-muted d-block mb-1">Género favorito</small>
            <span className="fs-5 fw-bold text-primary">{stats.generoFavorito}</span>
          </div>
        </div>
      </div>

      {/* TOP 4 FAVORITAS */}
      <section className="mb-4 p-3 rounded-3 bg-dark border border-secondary">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h5 className="fw-bold mb-0 text-white">
            <i className="bi bi-heart-fill text-danger me-2"></i>
            Top 4 Favoritas ({favoritas.length}/4)
          </h5>
          <span className="text-muted extra-small">Abre cualquier película para fijarla como favorita.</span>
        </div>

        {favoritas.length === 0 ? (
          <p className="text-muted small mb-0">Todavía no has fijado películas favoritas.</p>
        ) : (
          <div className="profile-grid">
            {favoritas.map((peli) => (
              <MovieCard key={`fav-${peli.id}`} peli={peli} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
            ))}
          </div>
        )}
      </section>

      <div className="profile-grid">
        {peliculasPerfil.length === 0 ? (
          <p className="text-muted w-100 text-center mt-4">Aún no has clasificado películas en esta categoría.</p>
        ) : (
          peliculasPerfil.map((peli) => (
            <MovieCard key={peli.id} peli={peli} onCambiarEstado={onCambiarEstado} onAbrirDetalles={onAbrirDetalles} onCalificar={onCalificar} />
          ))
        )}
      </div>
    </div>
  );
}
