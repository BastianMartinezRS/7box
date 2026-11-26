const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
const TOKEN_KEY = 'token_7box';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')) {
      unauthorizedHandler();
    }
    const error = new Error(data?.error || `Error HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function loginRequest(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function registerRequest(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getCurrentUserRequest() {
  return request('/auth/me');
}

export function changePasswordRequest(currentPassword, newPassword) {
  return request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function getPeliculasRequest() {
  return request('/peliculas');
}

export function createPeliculaRequest(pelicula) {
  return request('/peliculas', {
    method: 'POST',
    body: JSON.stringify(pelicula),
  });
}

export function updatePeliculaRequest(id, pelicula) {
  return request(`/peliculas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pelicula),
  });
}

export function deletePeliculaRequest(id) {
  return request(`/peliculas/${id}`, {
    method: 'DELETE',
  });
}

export function updatePerfilPeliculaRequest(id, payload) {
  return request(`/peliculas/${id}/perfil`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getResenasRequest(peliculaId) {
  return request(`/peliculas/${peliculaId}/resenas`);
}

export function createResenaRequest(peliculaId, payload) {
  return request(`/peliculas/${peliculaId}/resenas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateResenaRequest(resenaId, payload) {
  return request(`/resenas/${resenaId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteResenaRequest(resenaId) {
  return request(`/resenas/${resenaId}`, {
    method: 'DELETE',
  });
}

export function getAdminUsuariosRequest() {
  return request('/admin/usuarios');
}

export function changeUserRoleRequest(id, role) {
  return request(`/admin/usuarios/${id}/rol`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function deleteAdminUsuarioRequest(id) {
  return request(`/admin/usuarios/${id}`, {
    method: 'DELETE',
  });
}
