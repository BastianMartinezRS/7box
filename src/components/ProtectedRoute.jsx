import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ usuarioActual, requireAdmin = false, children }) {
  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }

  const esAdmin = usuarioActual.role === 'ROLE_ADMIN' || usuarioActual.esAdmin === true;
  if (requireAdmin && !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
