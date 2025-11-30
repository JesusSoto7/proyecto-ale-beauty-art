import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Badge,
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';

import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { useNavigate } from 'react-router-dom';

// Utilidad para mostrar la fecha de hoy (formato corto: 30 nov. 2025)
function getTodayString() {
  const today = new Date();
  return today.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Header() {
  const [user, setUser] = useState(null);
  const [pendingMessagesCount, setPendingMessagesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://localhost:4000/api/v1/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("https://localhost:4000/api/v1/support_messages/pending_count", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error("Error al obtener conteo de mensajes pendientes:", res.status);
        return;
      }
      const data = await res.json();
      setPendingMessagesCount(data.pending_count || 0);
    } catch (err) {
      console.error("Error de red al obtener conteo:", err);
    }
  };

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        pt: 2,
        pb: 1.5,
        maxWidth: { md: '1700px' },
        mx: 'auto'
      }}
    >
      {/* Izquierda: saludo */}
      <Stack spacing={0.5}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '.4px'
          }}
        >
          {`¡Bienvenido de nuevo${user?.nombre ? `, ${user.nombre}` : ''}!`}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontSize: 14 }}
        >
          Estas son las estadísticas de hoy de tu tienda en línea.
        </Typography>
      </Stack>

      {/* Derecha: fecha + tema + notificaciones + perfil */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Fecha de hoy */}
        <Box
          sx={{
            px: 2,
            py: 1,
            borderRadius: 5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            fontWeight: 500,
            fontSize: 15,
            color: 'text.secondary',
          }}
        >
          {getTodayString()}
        </Box>

        <ColorModeIconDropdown />

        <IconButton
          aria-label="notifications"
          onClick={() => navigate(`/home/support-messages`)}
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            width: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': { bgcolor: (theme) => theme.palette.action.hover }
          }}
        >
          <Badge
            badgeContent={pendingMessagesCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 600
              }
            }}
          >
            <NotificationsRoundedIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={() => navigate(`/home/perfil`)}
          sx={{
            cursor: 'pointer',
            px: 1.2,
            py: 0.6,
            borderRadius: 40,
            transition: 'background-color .2s',
            '&:hover': {
              bgcolor: (theme) => theme.palette.action.hover
            }
          }}
        >
          <Avatar
            alt={user?.nombre || 'Usuario'}
            src="/static/images/avatar/7.jpg"
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#3d8bf2ff',
              fontWeight: 600
            }}
          >
            {(!user?.nombre || user?.nombre.length === 0) ? '?' : user.nombre.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: 14,
              color: 'text.primary',
              whiteSpace: 'nowrap'
            }}
          >
            {user?.nombre || 'Usuario'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}