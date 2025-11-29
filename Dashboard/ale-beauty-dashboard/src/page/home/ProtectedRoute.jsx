import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../services/authService';

export default function ProtectedRoute({ requiredRole, children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={`/login`} replace state={{ from: location }} />;
  }
  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to={`/403`} replace />;
  }
  return children;
}