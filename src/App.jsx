import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import { peliculasIniciales } from './data/peliculas';
import Navbar from './components/Navbar';
import Modals from './components/Modals';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';

export default function App() {
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const saved = localStorage.getItem('usuarioActual');
    return saved ? JSON.parse(saved) : null;
  });

  const [peliculas, setPeliculas] = useState(() => {
    const saved = localStorage.getItem('peliculas');
    return saved ? JSON.parse(saved) : peliculasIniciales;
  });

  const [usuarios, setUsuarios] = useState(() => {
    const saved = localStorage.getItem('usuarios_7box');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sinAdmin = parsed.filter(u => u.nombre.toLowerCase() !== 'admin');
        return [{ nombre: 'admin', clave: 'admin', esAdmin: true }, ...sinAdmin];
      } catch (e) {
        console.error('Error al cargar usuarios de localStorage:', e);
      }
    }
    return [{ nombre: 'admin', clave: 'admin', esAdmin: true }];
  });

  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

  useEffect(() => {
    localStorage.setItem('peliculas', JSON.stringify(peliculas));
  }, [peliculas]);

  useEffect(() => {
    localStorage.setItem('usuarios_7box', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('usuarioActual');
    }
  }, [usuarioActual]);

  const handleLogin = (nombre, clave) => {
    const nombreLimpio = (nombre || '').trim();
    if (!nombreLimpio) {
      return { success: false, error: 'Por favor ingresa tu nombre de usuario.' };
    }
    if (!clave) {
      return { success: false, error: 'Por favor ingresa tu contraseña.' };
    }

    // Validación admin con clave 'admin'
    if (nombreLimpio.toLowerCase() === 'admin') {
      if (clave === 'admin') {
        const adminUser = { nombre: 'admin', clave: 'admin', esAdmin: true };
        setUsuarioActual(adminUser);
        return { success: true };
      } else {
        return { success: false, error: 'Contraseña incorrecta para el usuario admin.' };
      }
    }

    // Validación para usuarios no admin
    const usuarioEncontrado = usuarios.find(
      u => u.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );

    if (!usuarioEncontrado) {
      return { 
        success: false, 
        error: `El usuario "${nombreLimpio}" no existe. Regístrate en la pestaña "Registrarse".` 
      };
    }

    if (usuarioEncontrado.clave !== clave) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    const sesionUsuario = {
      nombre: usuarioEncontrado.nombre,
      clave: usuarioEncontrado.clave,
      esAdmin: false
    };
    setUsuarioActual(sesionUsuario);
    return { success: true };
  };

  const handleRegister = (nombre, clave) => {
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

    const formatoValido = /^[a-zA-Z0-9_-]+$/.test(nombreLimpio);
    if (!formatoValido) {
      return { success: false, error: 'El usuario solo puede tener letras, números, guiones (-) y guiones bajos (_).' };
    }

    if (nombreLimpio.toLowerCase() === 'admin') {
      return { success: false, error: 'El usuario "admin" está reservado para el administrador del sistema.' };
    }

    const existe = usuarios.some(
      u => u.nombre.toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (existe) {
      return { success: false, error: `El usuario "${nombreLimpio}" ya está registrado. Por favor elige otro.` };
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

    const nuevoUsuario = {
      nombre: nombreLimpio,
      clave: clave,
      esAdmin: false
    };

    setUsuarios(prev => [...prev, nuevoUsuario]);
    setUsuarioActual(nuevoUsuario);
    return { success: true };
  };

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  const handleCambiarEstado = (idPelicula, estadoSeleccionado) => {
    setPeliculas(prev => prev.map(peli => {
      if (String(peli.id) === String(idPelicula)) {
        const nuevoEstado = peli.estadoPerfil === estadoSeleccionado ? 'ninguno' : estadoSeleccionado;
        const peliActualizada = { ...peli, estadoPerfil: nuevoEstado };
        if (peliculaSeleccionada && String(peliculaSeleccionada.id) === String(idPelicula)) {
          setPeliculaSeleccionada(peliActualizada);
        }
        return peliActualizada;
      }
      return peli;
    }));
  };

  const handleAbrirDetalles = (idPelicula) => {
    const peli = peliculas.find(p => String(p.id) === String(idPelicula));
    if (peli) {
      setPeliculaSeleccionada(peli);
      const modalElem = document.getElementById("modalPelicula");
      const ModalClass = bootstrap?.Modal || window.bootstrap?.Modal;
      if (modalElem && ModalClass) {
        const modalInstance = ModalClass.getOrCreateInstance(modalElem);
        modalInstance.show();
      }
    }
  };

  const handleCalificar = (idPelicula, puntuacion) => {
    setPeliculas(prev => prev.map(peli => {
      if (String(peli.id) === String(idPelicula)) {
        const nuevaPuntuacion = peli.miPuntuacion === puntuacion ? null : puntuacion;
        const peliActualizada = { ...peli, miPuntuacion: nuevaPuntuacion };
        if (peliculaSeleccionada && String(peliculaSeleccionada.id) === String(idPelicula)) {
          setPeliculaSeleccionada(peliActualizada);
        }
        return peliActualizada;
      }
      return peli;
    }));
  };

  const handleAgregarPelicula = (nuevaPeli) => {
    setPeliculas(prev => [nuevaPeli, ...prev]);
  };

  return (
    <BrowserRouter>
      <div className="text-white min-vh-100 w-100" style={{ backgroundColor: '#0e1017' }}>
        {usuarioActual && (
          <Navbar 
            usuarioActual={usuarioActual} 
            onSearch={setFiltroBusqueda} 
            onLogout={handleLogout} 
          />
        )}

        <Routes>
          <Route 
            path="/login" 
            element={!usuarioActual ? <Login onLogin={handleLogin} onRegister={handleRegister} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={usuarioActual ? (
              <Home 
                peliculas={peliculas} 
                filtroBusqueda={filtroBusqueda} 
                onCambiarEstado={handleCambiarEstado} 
                onAbrirDetalles={handleAbrirDetalles} 
                onCalificar={handleCalificar} 
              />
            ) : <Navigate to="/login" />} 
          />
          <Route 
            path="/perfil" 
            element={usuarioActual ? (
              <Profile 
                peliculas={peliculas} 
                onCambiarEstado={handleCambiarEstado} 
                onAbrirDetalles={handleAbrirDetalles} 
                onCalificar={handleCalificar} 
              />
            ) : <Navigate to="/login" />} 
          />
        </Routes>

        <Modals 
          peliculaSeleccionada={peliculaSeleccionada} 
          onAgregarPelicula={handleAgregarPelicula} 
          onCalificar={handleCalificar} 
          onCambiarEstado={handleCambiarEstado} 
        />
      </div>
    </BrowserRouter>
  );
}