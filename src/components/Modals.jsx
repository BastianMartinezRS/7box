import React, { useEffect, useState } from 'react';
import * as bootstrap from 'bootstrap';
import {
  createResenaRequest,
  deleteResenaRequest,
  getResenasRequest,
  updateResenaRequest,
} from '../services/api';
import { getYouTubeEmbedUrl, handlePosterError } from '../utils/movieHelpers';

const ESTADO_DETALLE_BADGES = {
  vista: { cls: 'bg-success text-white', label: '✓ Vista' },
  por_ver: { cls: 'bg-info text-dark', label: '◷ Por ver' },
  abandonada: { cls: 'bg-warning text-dark', label: '⏸ Abandonada' },
  no_gusto: { cls: 'bg-danger text-white', label: '✕ No me gustó' },
};

function buildInitialForm(peliculaAEditar) {
  if (!peliculaAEditar) {
    return {
      titulo: '',
      director: '',
      nota: '',
      duracion: '',
      fecha: '',
      imagen: '',
      trailer: '',
      generos: '',
      sinopsis: '',
    };
  }

  return {
    titulo: peliculaAEditar.titulo || '',
    director: peliculaAEditar.director || '',
    nota: peliculaAEditar.nota !== undefined && peliculaAEditar.nota !== null ? String(peliculaAEditar.nota) : '',
    duracion: peliculaAEditar.duracion || '',
    fecha: peliculaAEditar.fecha || '',
    imagen: peliculaAEditar.imagen || '',
    trailer: peliculaAEditar.trailer || '',
    generos: Array.isArray(peliculaAEditar.generos) ? peliculaAEditar.generos.join(', ') : '',
    sinopsis: peliculaAEditar.sinopsis || '',
  };
}

function ocultarModal(id) {
  const modalElem = document.getElementById(id);
  const ModalClass = bootstrap?.Modal || window.bootstrap?.Modal;
  if (ModalClass && modalElem) {
    const modalInstance = ModalClass.getOrCreateInstance(modalElem);
    modalInstance.hide();
  }
}

function PeliculaFormModalBody({ peliculaAEditar, onAgregarPelicula, onEditarPelicula }) {
  const [formPeli, setFormPeli] = useState(() => buildInitialForm(peliculaAEditar));
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const handleChange = (e) => {
    setFormPeli({ ...formPeli, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    try {
      const payload = {
        titulo: formPeli.titulo.trim(),
        director: formPeli.director.trim() || null,
        nota: parseFloat(formPeli.nota),
        duracion: formPeli.duracion.trim() || null,
        fecha: formPeli.fecha.trim() || new Date().toISOString().split('T')[0],
        imagen: formPeli.imagen.trim(),
        trailer: formPeli.trailer.trim() || null,
        generos: formPeli.generos
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
        sinopsis: formPeli.sinopsis.trim() || null,
        categoria: 'emision',
      };

      if (peliculaAEditar) {
        await onEditarPelicula(peliculaAEditar.id, payload);
      } else {
        await onAgregarPelicula(payload);
      }

      setFormPeli(buildInitialForm(null));
      ocultarModal('modalAgregarPelicula');
    } catch (err) {
      setErrorForm(err.message || 'No se pudo guardar la película.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-body p-3 p-sm-4">
      {errorForm && (
        <div className="alert-7box-error py-2 px-3 small mb-3">
          {errorForm}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small text-muted">Título</label>
          <input type="text" id="titulo" value={formPeli.titulo} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="Ej: Spider-Man" required />
        </div>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="form-label small text-muted">Nota IMDb</label>
            <input type="number" step="0.1" max="10" min="0" id="nota" value={formPeli.nota} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="8.5" required />
          </div>
          <div className="col-6">
            <label className="form-label small text-muted">Duración</label>
            <input type="text" id="duracion" value={formPeli.duracion} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="2h 15m" />
          </div>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="form-label small text-muted">Director</label>
            <input type="text" id="director" value={formPeli.director} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="Ej: Christopher Nolan" />
          </div>
          <div className="col-6">
            <label className="form-label small text-muted">Fecha</label>
            <input type="text" id="fecha" value={formPeli.fecha} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="2026-07-24" />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">URL de la Imagen (Póster)</label>
          <input type="url" id="imagen" value={formPeli.imagen} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="https://..." required />
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">URL del Tráiler (YouTube)</label>
          <input type="url" id="trailer" value={formPeli.trailer} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="https://www.youtube.com/..." />
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">Géneros (separados por coma)</label>
          <input type="text" id="generos" value={formPeli.generos} onChange={handleChange} className="form-control bg-dark text-white border-secondary" placeholder="Acción, Ciencia Ficción" />
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">Sinopsis</label>
          <textarea id="sinopsis" value={formPeli.sinopsis} onChange={handleChange} className="form-control bg-dark text-white border-secondary" rows="3" placeholder="Resumen..."></textarea>
        </div>
        <div className="d-flex justify-content-end gap-2 pt-2">
          <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal" disabled={guardando}>Cancelar</button>
          <button type="submit" className="btn btn-success btn-sm fw-bold px-4" disabled={guardando}>
            {guardando ? 'Guardando...' : (peliculaAEditar ? 'Actualizar Película' : 'Guardar Película')}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChangePasswordModalBody({ onCambiarClave }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setGuardando(true);
    try {
      await onCambiarClave(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      ocultarModal('modalCambiarClave');
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-body p-3 p-sm-4">
      {error && <div className="alert-7box-error py-2 px-3 small mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label small text-muted">Contraseña actual</label>
          <input
            type="password"
            className="form-control bg-dark text-white border-secondary"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">Nueva contraseña</label>
          <input
            type="password"
            className="form-control bg-dark text-white border-secondary"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label small text-muted">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="form-control bg-dark text-white border-secondary"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal" disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-success btn-sm fw-bold" disabled={guardando}>
            {guardando ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PeliculaResenasSection({ peliculaId, esAdmin, onNotify }) {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [comentario, setComentario] = useState('');
  const [puntuacion, setPuntuacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editComentario, setEditComentario] = useState('');
  const [editPuntuacion, setEditPuntuacion] = useState('');

  useEffect(() => {
    let activo = true;
    getResenasRequest(peliculaId)
      .then((data) => {
        if (activo) {
          setResenas(Array.isArray(data) ? data : []);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err.message || 'No se pudieron cargar las reseñas.');
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [peliculaId]);

  const handleCrearResena = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setError('');
    setEnviando(true);
    try {
      const creada = await createResenaRequest(peliculaId, {
        comentario: comentario.trim(),
        puntuacion: puntuacion ? parseInt(puntuacion, 10) : null,
      });
      setResenas((prev) => [creada, ...prev]);
      setComentario('');
      setPuntuacion('');
      onNotify?.('Reseña publicada.');
    } catch (err) {
      setError(err.message || 'No se pudo publicar la reseña.');
    } finally {
      setEnviando(false);
    }
  };

  const handleIniciarEdicion = (resena) => {
    setEditandoId(resena.id);
    setEditComentario(resena.comentario);
    setEditPuntuacion(resena.puntuacion ? String(resena.puntuacion) : '');
    setError('');
  };

  const handleGuardarEdicion = async (resenaId) => {
    if (!editComentario.trim()) return;
    setError('');
    try {
      const actualizada = await updateResenaRequest(resenaId, {
        comentario: editComentario.trim(),
        puntuacion: editPuntuacion ? parseInt(editPuntuacion, 10) : null,
      });
      setResenas((prev) => prev.map((r) => (r.id === resenaId ? actualizada : r)));
      setEditandoId(null);
      onNotify?.('Reseña actualizada.');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la reseña.');
    }
  };

  const handleEliminarResena = async (resenaId) => {
    setError('');
    try {
      await deleteResenaRequest(resenaId);
      setResenas((prev) => prev.filter((r) => r.id !== resenaId));
      onNotify?.('Reseña eliminada.');
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la reseña.');
    }
  };

  return (
    <div className="mt-4 pt-3 border-top border-secondary">
      <h5 className="fw-bold text-primary mb-3">
        <i className="bi bi-chat-square-text-fill me-2"></i>
        Reseñas de la comunidad ({resenas.length})
      </h5>

      {error && (
        <div className="alert-7box-error py-2 px-3 small mb-3">{error}</div>
      )}

      <form onSubmit={handleCrearResena} className="p-3 mb-3 rounded bg-dark border border-secondary">
        <div className="mb-2">
          <textarea
            className="form-control form-control-sm bg-black text-white border-secondary"
            rows="2"
            maxLength={1000}
            placeholder="Escribe tu opinión sobre esta película..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={enviando}
            required
          />
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <select
            aria-label="Puntuación de reseña"
            className="form-select form-select-sm bg-black text-white border-secondary"
            style={{ width: 'auto' }}
            value={puntuacion}
            onChange={(e) => setPuntuacion(e.target.value)}
            disabled={enviando}
          >
            <option value="">Nota opcional...</option>
            <option value="5">★★★★★ (5/5)</option>
            <option value="4">★★★★ (4/5)</option>
            <option value="3">★★★ (3/5)</option>
            <option value="2">★★ (2/5)</option>
            <option value="1">★ (1/5)</option>
          </select>
          <button type="submit" className="btn btn-sm btn-success fw-bold" disabled={enviando}>
            {enviando ? 'Publicando...' : 'Publicar reseña'}
          </button>
        </div>
      </form>

      {cargando ? (
        <p className="text-muted small">Cargando reseñas...</p>
      ) : resenas.length === 0 ? (
        <p className="text-muted small mb-0">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
      ) : (
        <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {resenas.map((r) => (
            <div key={r.id} className="p-3 rounded bg-dark border border-secondary">
              <div className="d-flex justify-content-between align-items-center mb-1 gap-2 flex-wrap">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-info small">{r.username}</span>
                  {r.esMia && <span className="badge bg-secondary extra-small">Tú</span>}
                  {r.puntuacion && (
                    <span className="badge bg-warning text-dark extra-small">★ {r.puntuacion}/5</span>
                  )}
                </div>
                <small className="text-muted extra-small">
                  {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-CL') : ''}
                </small>
              </div>

              {editandoId === r.id ? (
                <div className="mt-2">
                  <textarea
                    className="form-control form-control-sm bg-black text-white border-secondary mb-2"
                    rows="2"
                    value={editComentario}
                    onChange={(e) => setEditComentario(e.target.value)}
                  />
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <select
                      className="form-select form-select-sm bg-black text-white border-secondary"
                      style={{ width: 'auto' }}
                      value={editPuntuacion}
                      onChange={(e) => setEditPuntuacion(e.target.value)}
                    >
                      <option value="">Sin nota</option>
                      <option value="5">5 / 5</option>
                      <option value="4">4 / 5</option>
                      <option value="3">3 / 5</option>
                      <option value="2">2 / 5</option>
                      <option value="1">1 / 5</option>
                    </select>
                    <div className="d-flex gap-1">
                      <button type="button" className="btn btn-sm btn-success" onClick={() => handleGuardarEdicion(r.id)}>
                        Guardar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditandoId(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-light small mb-2">{r.comentario}</p>
                  {(r.esMia || esAdmin) && (
                    <div className="d-flex gap-2 justify-content-end">
                      {r.esMia && (
                        <button
                          type="button"
                          className="btn btn-outline-info btn-sm py-0 px-2 extra-small"
                          onClick={() => handleIniciarEdicion(r)}
                        >
                          Editar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm py-0 px-2 extra-small"
                        onClick={() => handleEliminarResena(r.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeliculaDetalleBody({
  esAdmin,
  peliculaSeleccionada,
  onSolicitarEdicion,
  onEliminarPelicula,
  onCambiarEstado,
  onCalificar,
  onToggleFavorita,
  onNotify,
}) {
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [mostrarTrailer, setMostrarTrailer] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(peliculaSeleccionada.trailer);
  const badgeEstado = peliculaSeleccionada.estadoPerfil && peliculaSeleccionada.estadoPerfil !== 'ninguno'
    ? ESTADO_DETALLE_BADGES[peliculaSeleccionada.estadoPerfil]
    : null;

  const handleEliminarDesdeDetalle = async () => {
    if (!esAdmin || !peliculaSeleccionada) return;
    await onEliminarPelicula(peliculaSeleccionada.id);
    setConfirmarEliminar(false);
    ocultarModal('modalPelicula');
  };

  return (
    <div>
      <div className="row g-3 g-md-4 align-items-center">
        <div className="col-12 col-md-5 text-center">
          <img
            src={peliculaSeleccionada.imagen}
            className="img-fluid rounded-3 shadow"
            style={{ maxHeight: '380px', objectFit: 'cover' }}
            alt={peliculaSeleccionada.titulo}
            onError={handlePosterError}
          />
        </div>
        <div className="col-12 col-md-7">
          <h2 className="fw-bold text-white mb-1 pe-4 fs-4 fs-md-2">{peliculaSeleccionada.titulo}</h2>
          <p className="text-secondary fst-italic small mb-3">{peliculaSeleccionada.tagline || ''}</p>
          <p className="text-light small lh-base mb-3">{peliculaSeleccionada.sinopsis || 'Sin sinopsis disponible.'}</p>

          <div className="mb-3">
            <span className="text-muted small d-block mb-2 fw-bold">Géneros</span>
            <div className="d-flex flex-wrap gap-2">
              {peliculaSeleccionada.generos?.map((g, idx) => (
                <span key={idx} className="badge bg-secondary extra-small">{g}</span>
              ))}
            </div>
          </div>

          <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm fw-bold d-inline-flex align-items-center gap-1 ${
                peliculaSeleccionada.esFavorita ? 'btn-danger text-white' : 'btn-outline-danger'
              }`}
              onClick={() => onToggleFavorita && onToggleFavorita(peliculaSeleccionada.id)}
            >
              <i className={`bi ${peliculaSeleccionada.esFavorita ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              {peliculaSeleccionada.esFavorita ? 'En Top 4' : 'Top 4 Favorita'}
            </button>

            {embedUrl && (
              <button
                type="button"
                className="btn btn-danger btn-sm fw-bold px-3 d-inline-flex align-items-center gap-2"
                onClick={() => setMostrarTrailer((prev) => !prev)}
              >
                <i className="bi bi-play-circle-fill fs-6"></i>
                {mostrarTrailer ? 'Ocultar Tráiler' : 'Reproducir Tráiler'}
              </button>
            )}

            {peliculaSeleccionada.trailer && (
              <a
                href={peliculaSeleccionada.trailer}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-danger btn-sm fw-bold px-3 d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-youtube fs-6"></i> YouTube
              </a>
            )}

            {esAdmin && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm fw-bold d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    ocultarModal('modalPelicula');
                    onSolicitarEdicion(peliculaSeleccionada);
                  }}
                >
                  <i className="bi bi-pencil-square"></i> Editar
                </button>

                {confirmarEliminar ? (
                  <div className="d-inline-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm fw-bold"
                      onClick={handleEliminarDesdeDetalle}
                    >
                      Confirmar eliminar
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setConfirmarEliminar(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm fw-bold d-inline-flex align-items-center gap-1"
                    onClick={() => setConfirmarEliminar(true)}
                  >
                    <i className="bi bi-trash-fill"></i> Eliminar
                  </button>
                )}
              </>
            )}
          </div>

          {/* BOTONES DE ESTADO (RESPONSIVO EN MÓVIL) */}
          <div className="p-3 mb-3 rounded bg-dark border border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
              <span className="text-light fw-bold small">
                <i className="bi bi-bookmark-fill text-primary me-1"></i> Estado en mi lista:
              </span>
              {badgeEstado && (
                <span className={`badge ${badgeEstado.cls} extra-small`}>
                  {badgeEstado.label}
                </span>
              )}
            </div>
            <div className="row row-cols-2 row-cols-sm-4 g-2">
              <div className="col">
                <button
                  type="button"
                  className={`btn btn-sm w-100 ${peliculaSeleccionada.estadoPerfil === 'vista' ? 'btn-success text-white fw-bold' : 'btn-outline-success'}`}
                  onClick={() => onCambiarEstado && onCambiarEstado(peliculaSeleccionada.id, 'vista')}
                >
                  <i className="bi bi-check-circle-fill me-1"></i> Vista
                </button>
              </div>
              <div className="col">
                <button
                  type="button"
                  className={`btn btn-sm w-100 ${peliculaSeleccionada.estadoPerfil === 'por_ver' ? 'btn-info text-dark fw-bold' : 'btn-outline-info'}`}
                  onClick={() => onCambiarEstado && onCambiarEstado(peliculaSeleccionada.id, 'por_ver')}
                >
                  <i className="bi bi-bookmark-plus-fill me-1"></i> Por ver
                </button>
              </div>
              <div className="col">
                <button
                  type="button"
                  className={`btn btn-sm w-100 ${peliculaSeleccionada.estadoPerfil === 'abandonada' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning'}`}
                  onClick={() => onCambiarEstado && onCambiarEstado(peliculaSeleccionada.id, 'abandonada')}
                >
                  <i className="bi bi-pause-circle-fill me-1"></i> Aband.
                </button>
              </div>
              <div className="col">
                <button
                  type="button"
                  className={`btn btn-sm w-100 ${peliculaSeleccionada.estadoPerfil === 'no_gusto' ? 'btn-danger text-white fw-bold' : 'btn-outline-danger'}`}
                  onClick={() => onCambiarEstado && onCambiarEstado(peliculaSeleccionada.id, 'no_gusto')}
                >
                  <i className="bi bi-x-circle-fill me-1"></i> No gustó
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 mb-3 rounded bg-dark border border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-light fw-bold small"><i className="bi bi-star-fill text-warning me-1"></i> Mi Puntuación Personal:</span>
              <span className="badge bg-warning text-dark fw-bold">
                {peliculaSeleccionada.miPuntuacion ? `${peliculaSeleccionada.miPuntuacion} / 5` : 'Sin puntuar'}
              </span>
            </div>
            <div className="d-flex gap-2 align-items-center flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi ${star <= (peliculaSeleccionada.miPuntuacion || 0) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} fs-5 cursor-pointer`}
                  onClick={() => onCalificar && onCalificar(peliculaSeleccionada.id, star)}
                  title={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                />
              ))}
              {peliculaSeleccionada.miPuntuacion && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm ms-2 py-0 px-2 extra-small"
                  onClick={() => onCalificar && onCalificar(peliculaSeleccionada.id, null)}
                >
                  Quitar nota
                </button>
              )}
            </div>
          </div>

          <div className="row g-2 mt-2 text-center">
            <div className="col-6 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">Director</small>
                <span className="fw-bold text-white small">{peliculaSeleccionada.director || 'Desconocido'}</span>
              </div>
            </div>
            <div className="col-6 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">Fecha</small>
                <span className="fw-bold text-white small">{peliculaSeleccionada.fecha || 'N/A'}</span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">Duración</small>
                <span className="fw-bold text-white small">{peliculaSeleccionada.duracion || 'N/A'}</span>
              </div>
            </div>
            <div className="col-6 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">IMDb</small>
                <span className="fw-bold text-warning small">{peliculaSeleccionada.rating || peliculaSeleccionada.nota || 'N/A'}</span>
              </div>
            </div>
            <div className="col-6 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">Comunidad 7box</small>
                <span className="fw-bold text-info small">
                  {peliculaSeleccionada.promedioComunidad
                    ? `★ ${peliculaSeleccionada.promedioComunidad}/5 (${peliculaSeleccionada.totalVotosComunidad || 0})`
                    : 'Sin votos'}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="bg-dark p-2 rounded border border-secondary h-100">
                <small className="text-muted d-block extra-small">Votos</small>
                <span className="fw-bold text-white small">{peliculaSeleccionada.votos || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRÁILER EMBEBIDO */}
      {mostrarTrailer && embedUrl && (
        <div className="mt-4">
          <div className="ratio ratio-16x9 rounded-3 overflow-hidden border border-secondary">
            <iframe
              src={embedUrl}
              title={`Tráiler de ${peliculaSeleccionada.titulo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* RESEÑAS DE LA COMUNIDAD */}
      <PeliculaResenasSection peliculaId={peliculaSeleccionada.id} esAdmin={esAdmin} onNotify={onNotify} />
    </div>
  );
}

export default function Modals({
  esAdmin = false,
  peliculaSeleccionada,
  peliculaAEditar,
  onAgregarPelicula,
  onEditarPelicula,
  onEliminarPelicula,
  onSolicitarEdicion,
  onCalificar,
  onCambiarEstado,
  onToggleFavorita,
  onCambiarClave,
  onNotify,
}) {
  return (
    <>
      {/* MODAL CREAR / EDITAR PELÍCULA (RENDERIZADO SOLO SI ES ADMIN) */}
      {esAdmin && (
        <div className="modal fade" id="modalAgregarPelicula" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-modal text-white border-0 shadow-lg">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="bi bi-film me-2"></i>
                  {peliculaAEditar ? 'Editar Película' : 'Añadir Nueva Película'}
                </h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <PeliculaFormModalBody
                key={peliculaAEditar ? `edit-${peliculaAEditar.id}` : 'create'}
                peliculaAEditar={peliculaAEditar}
                onAgregarPelicula={onAgregarPelicula}
                onEditarPelicula={onEditarPelicula}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <div className="modal fade" id="modalCambiarClave" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-modal text-white border-0 shadow-lg">
            <div className="modal-header border-secondary">
              <h5 className="modal-title fw-bold text-primary">
                <i className="bi bi-key-fill me-2"></i>
                Cambiar Contraseña
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <ChangePasswordModalBody onCambiarClave={onCambiarClave} />
          </div>
        </div>
      </div>

      {/* MODAL DETALLES DE PELÍCULA */}
      <div className="modal fade" id="modalPelicula" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content bg-modal text-white border-0 shadow-lg">
            <div className="modal-body p-3 p-sm-4 position-relative">
              <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-3" data-bs-dismiss="modal"></button>

              {peliculaSeleccionada && (
                <PeliculaDetalleBody
                  key={peliculaSeleccionada.id}
                  esAdmin={esAdmin}
                  peliculaSeleccionada={peliculaSeleccionada}
                  onSolicitarEdicion={onSolicitarEdicion}
                  onEliminarPelicula={onEliminarPelicula}
                  onCambiarEstado={onCambiarEstado}
                  onCalificar={onCalificar}
                  onToggleFavorita={onToggleFavorita}
                  onNotify={onNotify}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
