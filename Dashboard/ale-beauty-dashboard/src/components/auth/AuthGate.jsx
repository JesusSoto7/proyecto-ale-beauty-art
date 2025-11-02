import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { setOnUnauthorized } from '../../services/api';
import { getToken, isTokenExpired, msUntilExpiry, logout } from '../../services/authService';

// Coloca este componente una sola vez, dentro del Router.
// Se encarga de:
// - Redirigir a login cuando el backend responde 401 (token inválido/caducado)
// - Programar logout cuando el token esté por expirar
// - Sincronizar logout entre pestañas con 'storage'
export default function AuthGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();

  const goLogin = React.useCallback(() => {
    const locale = lang || location.pathname.split('/')[1] || 'es';
    navigate(`/${locale}/login`, { replace: true, state: { from: location } });
  }, [lang, location, navigate]);

  const handleUnauthorized = React.useCallback(() => {
    logout();
    goLogin();
  }, [goLogin]);

  React.useEffect(() => {
    // 1) Global 401 handler
    setOnUnauthorized(() => handleUnauthorized());

    // 2) Programar logout al expirar token
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      handleUnauthorized();
      return;
    }
    // dispara unos segundos antes de expirar
    const safetyMs = 2000;
    const timeoutMs = Math.max(0, msUntilExpiry(token) - safetyMs);
    const id = setTimeout(() => handleUnauthorized(), timeoutMs);

    // 3) Escucha cambios en localStorage (logout en otras pestañas)
    function onStorage(ev) {
      if (ev.key === 'token' && !ev.newValue) {
        handleUnauthorized();
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      clearTimeout(id);
      window.removeEventListener('storage', onStorage);
    };
  }, [handleUnauthorized]);

  return null;
}