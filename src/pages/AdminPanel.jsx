import React, { useEffect, useState } from 'react';
import {
  changeUserRoleRequest,
  deleteAdminUsuarioRequest,
  getAdminUsuariosRequest,
} from '../services/api';
import { handlePosterError } from '../utils/movieHelpers';

export default function AdminPanel({
  usuarioActual,
  peliculas,
  onNuevaPelicula,
  onSolicitarEdicion,
  onEliminarPelicula,
  onAbrirDetalles,
}) {
  const [tab, setTab] = useState('peliculas');
  const [busqueda, setBusqueda] = useState('');
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState('');

  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [confirmandoUsuarioId, setConfirmandoUsuarioId] = useState(null);

  useEffect(() => {
    if (tab !== 'usuarios') return;
    let activo = true;
    getAdminUsuariosRequest()
      .then((data) => {
        if (activo) {
          setUsuarios(Array.isArray(data) ? data : []);
          setCargandoUsuarios(false);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err.message || 'No se pudieron cargar los usuarios.');
          setCargandoUsuarios(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [tab]);

  const peliculasFiltradas = peliculas.filter((p) =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmarEliminar = async (id) => {
    setError('');
    setEliminandoId(id);
    try {
      await onEliminarPelicula(id);
      setConfirmandoId(null);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la película.');
    } finally {
      setEliminandoId(null);
    }
  };

  const handleCambiarRol = async (usuario) => {
    setError('');
    const nuevoRol = usuario.esAdmin ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      const actualizado = await changeUserRoleRequest(usuario.id, nuevoRol);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? actualizado : u)));
    } catch (err) {
      setError(err.message || 'No se pudo cambiar el rol.');
    }
  };

  const handleEliminarUsuario = async (id) => {
    setError('');
    try {
      await deleteAdminUsuarioRequest(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setConfirmandoUsuarioId(null);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 mb-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary pb-3">
        <div>
          <span className="badge bg-success text-dark fw-bold mb-1">SOLO ADMINISTRADOR</span>
          <h3 className="fw-bold mb-0">
            <i className="bi bi-shield-lock-fill text-primary me-2"></i>
            Panel de Administración
          </h3>
        </div>

        <div className="btn-group btn-group-sm">
          <button
            type="button"
            className={`btn ${tab === 'peliculas' ? 'btn-success text-dark fw-bold' : 'btn-outline-light'}`}
            onClick={() => { setTab('peliculas'); setError(''); }}
          >
            <i className="bi bi-film me-1"></i> Catálogo ({peliculas.length})
          </button>
          <button
            type="button"
            className={`btn ${tab === 'usuarios' ? 'btn-success text-dark fw-bold' : 'btn-outline-light'}`}
            onClick={() => { setTab('usuarios'); setError(''); setCargandoUsuarios(true); }}
          >
            <i className="bi bi-people-fill me-1"></i> Usuarios
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-7box-error py-2 px-3 small mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      {tab === 'peliculas' ? (
        <>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white border-secondary"
              style={{ width: '240px' }}
              placeholder="Filtrar película por título..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-1"
              onClick={onNuevaPelicula}
            >
              <i className="bi bi-plus-lg"></i> Nueva Película
            </button>
          </div>

          <div className="table-responsive rounded-3 border border-secondary bg-dark">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small">
                  <th>Póster</th>
                  <th>Título</th>
                  <th>Director</th>
                  <th>Nota</th>
                  <th>Duración</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {peliculasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No se encontraron películas en el catálogo.
                    </td>
                  </tr>
                ) : (
                  peliculasFiltradas.map((peli) => (
                    <tr key={peli.id}>
                      <td>
                        <img
                          src={peli.imagen}
                          alt={peli.titulo}
                          className="rounded cursor-pointer"
                          style={{ width: '42px', height: '60px', objectFit: 'cover' }}
                          onError={handlePosterError}
                          onClick={() => onAbrirDetalles(peli.id)}
                        />
                      </td>
                      <td className="fw-semibold">{peli.titulo}</td>
                      <td className="text-muted small">{peli.director || 'Desconocido'}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-star-fill me-1"></i>
                          {peli.nota ?? peli.rating ?? 'N/A'}
                        </span>
                      </td>
                      <td className="text-muted small">{peli.duracion || 'N/A'}</td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() => onSolicitarEdicion(peli)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Editar
                          </button>

                          {confirmandoId === peli.id ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger fw-bold"
                                disabled={eliminandoId === peli.id}
                                onClick={() => handleConfirmarEliminar(peli.id)}
                              >
                                {eliminandoId === peli.id ? 'Eliminando...' : 'Confirmar'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setConfirmandoId(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setConfirmandoId(peli.id)}
                            >
                              <i className="bi bi-trash-fill me-1"></i> Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="table-responsive rounded-3 border border-secondary bg-dark">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small">
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargandoUsuarios ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => {
                  const esProtegido =
                    u.username.toLowerCase() === 'admin' ||
                    u.username.toLowerCase() === (usuarioActual?.nombre || '').toLowerCase();

                  return (
                    <tr key={u.id}>
                      <td className="text-muted small">#{u.id}</td>
                      <td className="fw-semibold">
                        {u.username}
                        {u.username.toLowerCase() === (usuarioActual?.nombre || '').toLowerCase() && (
                          <span className="badge bg-secondary ms-2 extra-small">Tú</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${u.esAdmin ? 'bg-success text-dark' : 'bg-info text-dark'}`}>
                          {u.esAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            disabled={esProtegido}
                            onClick={() => handleCambiarRol(u)}
                          >
                            {u.esAdmin ? 'Pasar a USER' : 'Hacer ADMIN'}
                          </button>

                          {confirmandoUsuarioId === u.id ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger fw-bold"
                                onClick={() => handleEliminarUsuario(u.id)}
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setConfirmandoUsuarioId(null)}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={esProtegido}
                              onClick={() => setConfirmandoUsuarioId(u.id)}
                            >
                              <i className="bi bi-trash-fill me-1"></i> Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
