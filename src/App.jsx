import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import Navbar from './components/Navbar';
import Modals from './components/Modals';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import {
  changePasswordRequest,
  clearToken,
  createPeliculaRequest,
  deletePeliculaRequest,
  getCurrentUserRequest,
  getPeliculasRequest,
  getToken,
  loginRequest,
  registerRequest,
  setToken,
  setUnauthorizedHandler,
  updatePeliculaRequest,
  updatePerfilPeliculaRequest,
} from './services/api';

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(getToken()));
  const [peliculas, setPeliculas] = useState([]);
  const [cargandoPeliculas, setCargandoPeliculas] = useState(false);
  const [errorApi, setErrorApi] = useState('');
  const [toast, setToast] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
  const [peliculaAEditar, setPeliculaAEditar] = useState(null);

  const esAdmin = usuarioActual?.role === 'ROLE_ADMIN' || usuarioActual?.esAdmin === true;

  const mostrarToast = useCallback((mensaje) => {
    setToast({ id: Date.now(), mensaje });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogout = useCallback(() => {
    clearToken();
    setUsuarioActual(null);
    setPeliculas([]);
    setPeliculaSeleccionada(null);
    setPeliculaAEditar(null);
    setErrorApi('');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  const cargarPeliculas = useCallback(async () => {
    setCargandoPeliculas(true);
    setErrorApi('');
    try {
      const lista = await getPeliculasRequest();
      setPeliculas(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setErrorApi(err.message || 'No se pudo cargar el catálogo desde el servidor.');
    } finally {
      setCargandoPeliculas(false);
    }
  }, []);

  // Restaurar sesion validando el token JWT contra el backend al recargar la pagina
  useEffect(() => {
    let activo = true;

    async function restaurarSesion() {
      const token = getToken();
      if (!token) {
        if (activo) setCargandoSesion(false);
        return;
      }

      try {
        const userInfo = await getCurrentUserRequest();
        if (!activo) return;
        setUsuarioActual({
          nombre: userInfo.username,
          role: userInfo.role,
          esAdmin: Boolean(userInfo.esAdmin),
        });
        await cargarPeliculas();
      } catch (err) {
        if (!activo) return;
        if (err.status === 401 || err.status === 403) {
          clearToken();
          setUsuarioActual(null);
        } else {
          setErrorApi('No se pudo verificar la sesión con el backend.');
        }
      } finally {
        if (activo) setCargandoSesion(false);
      }
    }

    restaurarSesion();
    return () => {
      activo = false;
    };
  }, [cargarPeliculas]);

  const handleLogin = async (nombre, clave) => {
    const nombreLimpio = (nombre || '').trim();
    if (!nombreLimpio) {
      return { success: false, error: 'Por favor ingresa tu nombre de usuario.' };
    }
    if (!clave) {
      return { success: false, error: 'Por favor ingresa tu contraseña.' };
    }

    try {
      const data = await loginRequest(nombreLimpio, clave);
      setToken(data.token);
      setUsuarioActual({
        nombre: data.username,
        role: data.role,
        esAdmin: Boolean(data.esAdmin),
      });
      await cargarPeliculas();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'No se pudo iniciar sesión.' };
    }
  };

  const handleRegister = async (nombre, clave) => {
    const nombreLimpio = (nombre || '').trim();

    if (!nombreLimpio) {
      return { success: false, error: 'El nombre de usuario es obligatorio.' };
    }
    if (nombreLimpio.length < 3) {
      return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }
    if (nombreLimpio.length > 20) {
      return { success: false, error: 'El nombre de usuario no puede tener más de 20 caracteres.' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(nombreLimpio)) {
      return { success: false, error: 'El usuario solo puede tener letras, números, guiones (-) y guiones bajos (_).' };
    }
    if (nombreLimpio.toLowerCase() === 'admin') {
      return { success: false, error: 'El usuario "admin" está reservado para el administrador del sistema.' };
    }
    if (!clave || clave.trim().length === 0) {
      return { success: false, error: 'La contraseña es obligatoria.' };
    }
    if (clave.length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
    }
    if (clave.length > 50) {
      return { success: false, error: 'La contraseña no puede exceder 50 caracteres.' };
    }

    try {
      const data = await registerRequest(nombreLimpio, clave);
      setToken(data.token);
      setUsuarioActual({
        nombre: data.username,
        role: data.role,
        esAdmin: Boolean(data.esAdmin),
      });
      await cargarPeliculas();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'No se pudo completar el registro.' };
    }
  };

  const reemplazarPeliculaEnEstado = (peliActualizada) => {
    setPeliculas((prev) =>
      prev.map((p) => (String(p.id) === String(peliActualizada.id) ? peliActualizada : p))
    );
    setPeliculaSeleccionada((actual) =>
      actual && String(actual.id) === String(peliActualizada.id) ? peliActualizada : actual
    );
  };

  const handleCambiarEstado = async (idPelicula, estadoSeleccionado) => {
    const actual = peliculas.find((p) => String(p.id) === String(idPelicula));
    if (!actual) return;
    const nuevoEstado = actual.estadoPerfil === estadoSeleccionado ? 'ninguno' : estadoSeleccionado;

    try {
      const actualizada = await updatePerfilPeliculaRequest(idPelicula, { estadoPerfil: nuevoEstado });
      reemplazarPeliculaEnEstado(actualizada);
      mostrarToast(nuevoEstado === 'ninguno' ? 'Película quitada de tu lista.' : `Estado actualizado a "${nuevoEstado.replace('_', ' ')}".`);
    } catch (err) {
      setErrorApi(err.message || 'No se pudo actualizar el estado de la película.');
    }
  };

  const handleCalificar = async (idPelicula, puntuacion) => {
    const actual = peliculas.find((p) => String(p.id) === String(idPelicula));
    if (!actual) return;
    const nuevaPuntuacion = puntuacion === null || actual.miPuntuacion === puntuacion ? null : puntuacion;
    const payload = nuevaPuntuacion === null ? { quitarPuntuacion: true } : { miPuntuacion: nuevaPuntuacion };

    try {
      const actualizada = await updatePerfilPeliculaRequest(idPelicula, payload);
      reemplazarPeliculaEnEstado(actualizada);
      mostrarToast(nuevaPuntuacion === null ? 'Puntuación eliminada.' : `Calificaste con ${nuevaPuntuacion}/5 estrellas.`);
    } catch (err) {
      setErrorApi(err.message || 'No se pudo actualizar la puntuación.');
    }
  };

  const handleToggleFavorita = async (idPelicula) => {
    const actual = peliculas.find((p) => String(p.id) === String(idPelicula));
    if (!actual) return;
    const siguiente = !actual.esFavorita;

    try {
      const actualizada = await updatePerfilPeliculaRequest(idPelicula, { esFavorita: siguiente });
      reemplazarPeliculaEnEstado(actualizada);
      mostrarToast(siguiente ? 'Añadida a tu Top 4 Favoritas.' : 'Quitada de tu Top 4 Favoritas.');
    } catch (err) {
      setErrorApi(err.message || 'No se pudo actualizar Top 4 Favoritas.');
    }
  };

  const handleCambiarClave = async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword);
    mostrarToast('Contraseña actualizada correctamente.');
  };

  const mostrarModal = (id) => {
    const modalElem = document.getElementById(id);
    const ModalClass = bootstrap?.Modal || window.bootstrap?.Modal;
    if (modalElem && ModalClass) {
      const modalInstance = ModalClass.getOrCreateInstance(modalElem);
      modalInstance.show();
    }
  };

  const handleAbrirDetalles = (idPelicula) => {
    const peli = peliculas.find((p) => String(p.id) === String(idPelicula));
    if (peli) {
      setPeliculaSeleccionada(peli);
      mostrarModal('modalPelicula');
    }
  };

  const handleAbrirNuevaPelicula = () => {
    if (!esAdmin) return;
    setPeliculaAEditar(null);
    mostrarModal('modalAgregarPelicula');
  };

  const handleAbrirCambiarClave = () => {
    mostrarModal('modalCambiarClave');
  };

  const handleSolicitarEdicion = (peli) => {
    if (!esAdmin) return;
    setPeliculaAEditar(peli);
    mostrarModal('modalAgregarPelicula');
  };

  const handleAgregarPelicula = async (nuevaPeli) => {
    if (!esAdmin) throw new Error('Acceso denegado: se requiere rol de administrador.');
    const creada = await createPeliculaRequest(nuevaPeli);
    setPeliculas((prev) => [creada, ...prev]);
    mostrarToast(`Película "${creada.titulo}" agregada al catálogo.`);
    return creada;
  };

  const handleEditarPelicula = async (idPelicula, datosPeli) => {
    if (!esAdmin) throw new Error('Acceso denegado: se requiere rol de administrador.');
    const actualizada = await updatePeliculaRequest(idPelicula, datosPeli);
    reemplazarPeliculaEnEstado(actualizada);
    setPeliculaAEditar(null);
    mostrarToast(`Película "${actualizada.titulo}" actualizada.`);
    return actualizada;
  };

  const handleEliminarPelicula = async (idPelicula) => {
    if (!esAdmin) throw new Error('Acceso denegado: se requiere rol de administrador.');
    await deletePeliculaRequest(idPelicula);
    setPeliculas((prev) => prev.filter((p) => String(p.id) !== String(idPelicula)));
    setPeliculaSeleccionada((actual) =>
      actual && String(actual.id) === String(idPelicula) ? null : actual
    );
    mostrarToast('Película eliminada del catálogo.');
  };

  if (cargandoSesion) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 text-white" style={{ backgroundColor: '#0e1017' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Verificando sesión...</span>
        </div>
        <p className="text-muted small mb-0">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="text-white min-vh-100 w-100" style={{ backgroundColor: '#0e1017' }}>
        {usuarioActual && (
          <Navbar
            usuarioActual={usuarioActual}
            onSearch={setFiltroBusqueda}
            onLogout={handleLogout}
            onNuevaPelicula={handleAbrirNuevaPelicula}
            onAbrirCambiarClave={handleAbrirCambiarClave}
          />
        )}

        {usuarioActual && errorApi && (
          <div className="container-fluid px-3 px-md-4 pt-3">
            <div className="alert-7box-error py-2 px-3 small d-flex justify-content-between align-items-center">
              <span>{errorApi}</span>
              <button
                type="button"
                className="btn-close btn-close-white btn-sm"
                aria-label="Cerrar"
                onClick={() => setErrorApi('')}
              />
            </div>
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={!usuarioActual ? <Login onLogin={handleLogin} onRegister={handleRegister} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={(
              <ProtectedRoute usuarioActual={usuarioActual}>
                {cargandoPeliculas && peliculas.length === 0 ? (
                  <div className="text-center py-5 text-muted">Cargando catálogo de películas...</div>
                ) : (
                  <Home
                    peliculas={peliculas}
                    filtroBusqueda={filtroBusqueda}
                    onCambiarEstado={handleCambiarEstado}
                    onAbrirDetalles={handleAbrirDetalles}
                    onCalificar={handleCalificar}
                  />
                )}
              </ProtectedRoute>
            )}
          />
          <Route
            path="/perfil"
            element={(
              <ProtectedRoute usuarioActual={usuarioActual}>
                <Profile
                  peliculas={peliculas}
                  onCambiarEstado={handleCambiarEstado}
                  onAbrirDetalles={handleAbrirDetalles}
                  onCalificar={handleCalificar}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute usuarioActual={usuarioActual} requireAdmin>
                <AdminPanel
                  usuarioActual={usuarioActual}
                  peliculas={peliculas}
                  onNuevaPelicula={handleAbrirNuevaPelicula}
                  onSolicitarEdicion={handleSolicitarEdicion}
                  onEliminarPelicula={handleEliminarPelicula}
                  onAbrirDetalles={handleAbrirDetalles}
                  onNotify={mostrarToast}
                />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to={usuarioActual ? '/' : '/login'} replace />} />
        </Routes>

        {usuarioActual && (
          <Modals
            esAdmin={esAdmin}
            peliculaSeleccionada={peliculaSeleccionada}
            peliculaAEditar={peliculaAEditar}
            onAgregarPelicula={handleAgregarPelicula}
            onEditarPelicula={handleEditarPelicula}
            onEliminarPelicula={handleEliminarPelicula}
            onSolicitarEdicion={handleSolicitarEdicion}
            onCalificar={handleCalificar}
            onCambiarEstado={handleCambiarEstado}
            onToggleFavorita={handleToggleFavorita}
            onCambiarClave={handleCambiarClave}
            onNotify={mostrarToast}
          />
        )}

        {toast && (
          <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
            <div className="toast-7box px-3 py-2 d-flex align-items-center gap-2 small" role="status">
              <i className="bi bi-check-circle-fill text-success"></i>
              <span>{toast.mensaje}</span>
              <button
                type="button"
                className="btn-close btn-close-white btn-sm ms-2"
                aria-label="Cerrar notificación"
                onClick={() => setToast(null)}
              />
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}
