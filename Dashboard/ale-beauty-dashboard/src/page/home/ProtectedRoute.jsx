import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../services/authService';

export default function ProtectedRoute({ requiredRole, children }) {
  const { lang } = useParams();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={`/${lang || 'es'}/login`} replace state={{ from: location }} />;
  }
  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to={`/${lang || 'es'}/403`} replace />;
  }
  return children;
}