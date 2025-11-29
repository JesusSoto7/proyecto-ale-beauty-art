import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setOnUnauthorized } from '../../services/api';
import { getToken, isTokenExpired, msUntilExpiry, logout } from '../../services/authService';

// Coloca este componente una sola vez, dentro del Router.
// - Redirige a login cuando el backend responde 401
// - Programa logout cuando el token esté por expirar
// - Sincroniza logout entre pestañas con 'storage'
// Evita bucles usando un guard (ref) y registrando los handlers una sola vez.
export default function AuthGate() {
  const navigate = useNavigate();
  const handlingRef = React.useRef(false);   // cerrojo contra reentrancias
  const handlerRef = React.useRef(null);     // referencia estable al handler

  // Función para cerrar sesión y redirigir, con guard contra múltiples invocaciones
  const doLogoutAndRedirect = React.useCallback(() => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    // Limpia sesión local (logout no hace llamadas si no hay endpoint configurado)
    logout();

    // Redirige al login sin prefijo de idioma
    navigate('/login', { replace: true });

    // Libera el cerrojo un poco después por si el árbol remonta en StrictMode
    setTimeout(() => { handlingRef.current = false; }, 1000);
  }, [navigate]);

  // Mantén la ref apuntando siempre a la versión vigente del handler
  React.useEffect(() => {
    handlerRef.current = doLogoutAndRedirect;
  }, [doLogoutAndRedirect]);

  // Registra handlers y timers UNA sola vez
  React.useEffect(() => {
    // 1) Global 401 handler (usa ref para no re-registrar)
    setOnUnauthorized(() => {
      if (handlerRef.current) handlerRef.current();
    });

    // 2) Revisa token actual y programa logout antes de expirar
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      if (handlerRef.current) handlerRef.current();
      return;
    }

    // Dispara unos segundos antes de expirar
    const safetyMs = 2000;
    const timeoutMs = Math.max(0, msUntilExpiry(token) - safetyMs);
    const id = setTimeout(() => {
      if (handlerRef.current) handlerRef.current();
    }, timeoutMs);

    // 3) Escucha logout en otras pestañas
    function onStorage(ev) {
      if (ev.key === 'token' && !ev.newValue) {
        if (handlerRef.current) handlerRef.current();
      }
    }
    window.addEventListener('storage', onStorage);

    return () => {
      clearTimeout(id);
      window.removeEventListener('storage', onStorage);
    };
    // Intencionalmente []: se registra una sola vez
  }, []);

  return null;
}