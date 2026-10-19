import React, { useState } from 'react';

export default function Login({ onLogin, onRegister }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor ingresa tu nombre de usuario.');
      return;
    }

    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    if (tab === 'login') {
      const res = onLogin(username, password);
      if (res && !res.success) {
        setError(res.error);
      }
    } else {
      const res = onRegister(username, password);
      if (res && !res.success) {
        setError(res.error);
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 w-100 px-3" style={{ backgroundColor: '#0e1017' }}>
      <div className="login-card p-4 p-sm-5 text-white" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <h1 className="fw-bold display-6 mb-1 text-primary">7box</h1>
          <p className="text-muted small">Ingresa para guardar tus listas de películas</p>
        </div>

        {error && (
          <div className="alert-7box-error py-2 px-3 small mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill flex-shrink-0 fs-6"></i>
            <span className="fw-medium">{error}</span>
          </div>
        )}

        <div className="d-flex p-1 rounded-3 mb-4" style={{ backgroundColor: '#181d2a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button 
            type="button" 
            className={`btn w-50 py-2 btn-sm fw-bold rounded-2 ${tab === 'login' ? 'btn-7box-primary' : 'text-muted border-0 bg-transparent'}`} 
            onClick={() => { setTab('login'); setError(''); }}
          >
            Ingresar
          </button>
          <button 
            type="button" 
            className={`btn w-50 py-2 btn-sm fw-bold rounded-2 ${tab === 'register' ? 'btn-7box-primary' : 'text-muted border-0 bg-transparent'}`} 
            onClick={() => { setTab('register'); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light small fw-medium mb-1">Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="form-control login-input w-100" 
              placeholder="Tu usuario" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-light small fw-medium mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-control login-input w-100" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-7box-primary w-100">
            {tab === 'login' ? 'Ingresar' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}