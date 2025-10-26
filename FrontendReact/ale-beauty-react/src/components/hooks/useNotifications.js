import { useState, useEffect, useCallback } from 'react';

export const useNotifications = (token) => {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesLoading, setNotificacionesLoading] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);

  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

  // Cargar contador de no leídas
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNoLeidas(data.filter(n => !n.read).length))
      .catch(err => console.error('Error loading notifications count:', err));
  }, [token]);

  const marcarTodasComoLeidas = useCallback(async (notificaciones) => {
    const noLeidasIds = notificaciones.filter(n => !n.read).map(n => n.id);
    if (noLeidasIds.length === 0) return;
    
    await Promise.all(noLeidasIds.map(id =>
      fetch(`https://localhost:4000/api/v1/notifications/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ read: true })
      })
    ));
  }, [token]);

  const handleOpenNotificationsMenu = useCallback(async (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setNotificacionesLoading(true);
    
    try {
      // Cargar notificaciones
      const res = await fetch("https://localhost:4000/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Marcar como leídas si hay no leídas
      if (data.some(n => !n.read)) {
        await marcarTodasComoLeidas(data);
      }
      
      // Recargar lista actualizada
      const res2 = await fetch("https://localhost:4000/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data2 = await res2.json();
      
      setNotificaciones(data2);
      setNoLeidas(data2.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setNotificacionesLoading(false);
    }
  }, [token, marcarTodasComoLeidas]);

  const handleCloseNotificationsMenu = useCallback(() => {
    setNotificationsAnchorEl(null);
  }, []);

  const formatNotificationTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }, []);

  return {
    notificationsAnchorEl,
    isNotificationsMenuOpen,
    notificaciones,
    notificacionesLoading,
    noLeidas,
    handleOpenNotificationsMenu,
    handleCloseNotificationsMenu,
    formatNotificationTime
  };
};