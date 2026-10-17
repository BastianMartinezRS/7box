import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

  useEffect(() => {
    localStorage.setItem('peliculas', JSON.stringify(peliculas));
  }, [peliculas]);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('usuarioActual');
    }
  }, [usuarioActual]);

  const handleLogin = (nombre, clave) => {
    const esAdmin = nombre.toLowerCase() === 'admin' && clave === 'admin123';
    const user = { nombre, clave, esAdmin };
    setUsuarioActual(user);
  };

  const handleRegister = (nombre, clave) => {
    const user = { nombre, clave, esAdmin: nombre.toLowerCase() === 'admin' };
    setUsuarioActual(user);
  };

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  const handleCambiarEstado = (idPelicula, estadoSeleccionado) => {
    setPeliculas(prev => prev.map(peli => {
      if (String(peli.id) === String(idPelicula)) {
        const nuevoEstado = peli.estadoPerfil === estadoSeleccionado ? 'ninguno' : estadoSeleccionado;
        return { ...peli, estadoPerfil: nuevoEstado };
      }
      return peli;
    }));
  };

  const handleAbrirDetalles = (idPelicula) => {
    const peli = peliculas.find(p => String(p.id) === String(idPelicula));
    if (peli) {
      setPeliculaSeleccionada(peli);
      if (window.bootstrap?.Modal) {
        const modalElem = document.getElementById("modalPelicula");
        const modalInstance = new window.bootstrap.Modal(modalElem);
        modalInstance.show();
      }
    }
  };

  const handleAgregarPelicula = (nuevaPeli) => {
    setPeliculas(prev => [nuevaPeli, ...prev]);
  };

  return (
    <BrowserRouter>
      <div className="bg-dark text-white min-vh-100">
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
              />
            ) : <Navigate to="/login" />} 
          />
        </Routes>

        <Modals 
          peliculaSeleccionada={peliculaSeleccionada} 
          onAgregarPelicula={handleAgregarPelicula} 
        />
      </div>
    </BrowserRouter>
  );
}