import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart, BsCart4 } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';


// Importa Modal de Joy UI
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import FavoritesModal from './FavoritesModal';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(2),
  width: 'auto',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '15ch',
    [theme.breakpoints.up('sm')]: {
      width: '25ch',
    },
  },
}));

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

  const [openModal, setOpenModal] = useState(false); // 👈 estado para modal

  const location = useLocation();
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  function handleSearchSubmit(e) {
    e.preventDefault();
    alert('Buscar: ' + searchTerm);
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    fetch('https://localhost:4000/api/v1/sign_out', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).finally(() => {
      window.location.href = '/login';
    });
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  // Menú del perfil
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleMenuClose}>Perfil</MenuItem>
      <MenuItem onClick={() => { navigate("/direcciones"); handleMenuClose(); }}>
        Mis direcciones
      </MenuItem>
      <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
    </Menu>
  );

  // Menú mobile
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IoPersonCircleSharp size={25} />
        <p style={{ marginLeft: 10 }}>Perfil</p>
      </MenuItem>
      <MenuItem component={Link} to="/carrito">
        <BsCart4 size={22} />
        <p style={{ marginLeft: 10 }}>Carrito</p>
      </MenuItem>
      <MenuItem onClick={() => setOpenModal(true)}>
        <BsHeart size={20} />
        <p style={{ marginLeft: 10 }}>Favoritos</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar>

          {/* Logo */}
          <Link to="/inicio">
            <img src={logo} alt="Logo" style={{ height: 40, borderRadius: 20 }} />
          </Link>

          {/* Navegación */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 3 }}>
            <Typography
              component={Link}
              to="/inicio"
              sx={{ mx: 2, color: 'black', textDecoration: 'none' }}
            >
              INICIO
            </Typography>
            <Typography
              component={Link}
              to="/products"
              sx={{ mx: 2, color: 'black', textDecoration: 'none' }}
            >
              PRODUCTOS
            </Typography>
          </Box>

          {/* Buscador */}
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Buscar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Search>
          </Box>

          {/* Íconos desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <IoPersonCircleSharp size={30} />
            </IconButton>
            <IconButton component={Link} to="/carrito" color="inherit">
              <BsCart4 size={25} />
            </IconButton>
            <IconButton color="inherit" onClick={() => setOpenModal(true)}>
              <BsHeart size={22} />
            </IconButton>


          </Box>

          {/* Menú mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={handleMobileMenuOpen} color="inherit">
              <MoreIcon />
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}

      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog size="lg">
          <ModalClose />
          <FavoritesModal open={openModal} onClose={() => setOpenModal(false)} />
        </ModalDialog>
      </Modal>
    </Box>
  );
}