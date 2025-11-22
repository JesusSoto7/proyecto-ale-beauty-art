import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Badge,
  Paper,
  InputBase,
  Menu,
  MenuItem
} from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CustomDatePicker from './CustomDatePicker';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { useNavigate, useParams } from 'react-router-dom';

export default function Header() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { lang } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://localhost:4000/api/v1/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

  const open = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const currentLang =
    lang && ['es', 'en'].includes(lang)
      ? lang
      : ((navigator.language || 'es').startsWith('es') ? 'es' : 'en');

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
          {`Welcome back${user?.nombre ? `, ${user.nombre}` : ''}`}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontSize: 14 }}
        >
          Here are today's stats from your online store!
        </Typography>
      </Stack>

      {/* Derecha: búsqueda + fecha + modo + notificaciones + perfil */}
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Barra de búsqueda */}
        {/*         <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.75,
            borderRadius: 5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : '#f3f3f3',
            minWidth: { sm: 260, md: 320 }
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <InputBase
            placeholder="Search"
            inputProps={{ 'aria-label': 'search' }}
            sx={{ flex: 1, fontSize: 14 }}
          />
        </Paper> */}

        <CustomDatePicker />

        {/* Selector de tema */}
        <ColorModeIconDropdown />

        {/* Notificaciones */}
        <IconButton
          aria-label="notifications"
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            width: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': { bgcolor: (theme) => theme.palette.action.hover }
          }}
        >
          <Badge
            badgeContent={4}
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

        {/* Perfil */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={handleMenuOpen}
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
            alt={user?.nombre || 'User'}
            src="/static/images/avatar/7.jpg"
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#f896b8',
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
            {user?.nombre || 'User'}
          </Typography>
          <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          keepMounted
          ModalProps={{ disableScrollLock: true }}
          MenuListProps={{ 'aria-labelledby': 'profile-button' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>{user?.email || 'user@example.com'}</MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate(`/${currentLang}/home/user-profile`);
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              localStorage.removeItem('token');
              window.location.href = `/${currentLang}/login`;
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}