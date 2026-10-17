import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ usuarioActual, onSearch, onLogout }) {
  const navigate = useNavigate();
  const esAdmin = usuarioActual?.esAdmin || usuarioActual?.nombre?.toLowerCase() === 'admin';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black px-3 py-2 border-bottom border-secondary sticky-top">
      <div className="container-fluid px-0">
        
        {/* LOGO */}
        <Link className="navbar-brand fw-bold text-primary fs-3 me-auto" to="/">
          7box <span className="fs-6 fw-normal text-muted d-none d-sm-inline">Inicio</span>
        </Link>

        <button 
          className="navbar-toggler border-0 shadow-none p-1" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContenido" 
          aria-controls="navbarContenido" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContenido">
          <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center ms-auto gap-2">

            {/* BOTÓN ADMIN (solo si es admin) */}
            {esAdmin && (
              <button 
                id="btn-admin-agregar" 
                className="btn btn-sm btn-success fw-bold text-nowrap d-flex align-items-center justify-content-center gap-1"
                data-bs-toggle="modal" 
                data-bs-target="#modalAgregarPelicula"
              >
                <i className="bi bi-plus-lg"></i> <span>Agregar Película</span>
              </button>
            )}

            {/* BUSCADOR */}
            <div className="w-100 my-1 my-lg-0" style={{ maxWidth: '250px' }}>
              <input 
                type="text" 
                className="form-control form-control-sm bg-dark text-white border-secondary w-100" 
                placeholder="Buscar película..."
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            
            {/* LINK MI PERFIL */}
            <Link 
              to="/perfil" 
              className="btn btn-sm btn-outline-success fw-bold text-nowrap d-flex align-items-center justify-content-center gap-1"
            >
              <i className="bi bi-person-circle"></i> <span>Mi Perfil</span>
            </Link>

            {/* USUARIO Y BOTÓN LOGOUT */}
            <div className="d-flex align-items-center justify-content-between justify-content-lg-end gap-2 pt-2 pt-lg-0">
              <span className="fw-bold text-info small text-nowrap">
                {usuarioActual?.nombre || 'Usuario'}
              </span>
              
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center px-3" 
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right"></i> <span className="d-lg-none ms-2">Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </nav>
  );
}