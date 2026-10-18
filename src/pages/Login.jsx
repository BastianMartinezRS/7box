import React, { useState } from 'react';

export default function Login({ onLogin, onRegister }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (password.trim().length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (tab === 'login') {
      onLogin(username, password);
    } else {
      onRegister(username, password);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-white">
      <div className="card bg-card border-secondary p-4 shadow-lg" style={{ maxWidth: '380px', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 className="text-white fw-bold display-6">7box</h1>
          <p className="text-muted small">Ingresa para guardar tus listas de películas</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <ul className="nav nav-pills nav-justified mb-3">
          <li className="nav-item">
            <button 
              className={`nav-link ${tab === 'login' ? 'active' : ''}`} 
              onClick={() => { setTab('login'); setError(''); }}
            >
              Ingresar
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${tab === 'register' ? 'active' : ''}`} 
              onClick={() => { setTab('register'); setError(''); }}
            >
              Registrarse
            </button>
          </li>
        </ul>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted">Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="Tu usuario" 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className={`btn w-100 ${tab === 'login' ? 'btn-purple' : 'btn-success'}`}>
            {tab === 'login' ? 'Ingresar' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}