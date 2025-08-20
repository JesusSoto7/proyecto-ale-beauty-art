import React, { useState, useEffect, useRef } from 'react';
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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const containerRef = useRef(null);   // para click fuera
  const debounceRef = useRef(null);

  const DEBOUNCE_MS = 250;

  function handleSearchSubmit(e) {
    e.preventDefault();
    // Intencional: no navegamos para no cambiar la vista.
    // Si quieres que presionar Enter vaya a /products?search=...
    // puedes descomentar la línea siguiente:
    // if (searchTerm.trim()) navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  }

  // Cierra dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (containerRef.current && !containerRef.current.contains(ev.target)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(searchTerm);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  async function fetchResults(q) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // si tu API necesita auth
      const res = await fetch('https://localhost:4000/api/v1/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Depuración: muestra status y si hay problema lanza error
      if (!res.ok) {
        console.error('Error en fetch products:', res.status, res.statusText);
        setResults([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        // Algunos backends devuelven { products: [...] } u otro shape
        console.warn('Respuesta products no es array, shape recibido:', data);
        // intenta intentar extraer un array común:
        const arr = Array.isArray(data.products) ? data.products : [];
        setResults(filterAndLimit(arr, q));
        setLoading(false);
        return;
      }

      setResults(filterAndLimit(data, q));
    } catch (err) {
      console.error('fetchResults error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function filterAndLimit(array, q) {
    const term = (q || '').toString().toLowerCase();
    const filtered = array.filter((prod) => {
      const name = (prod?.nombre_producto || prod?.name || prod?.titulo || '').toString().toLowerCase();
      return name.includes(term);
    });
    return filtered.slice(0, 6); // máximo 6 resultados
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    try {
      await fetch('https://localhost:4000/api/v1/sign_out', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/login';
    }
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

  // Si presionan un resultado -> navega al detalle (usa slug si existe, si no id)
  function goToProduct(prod) {
    const slugOrId = prod?.slug || prod?.id;
    if (!slugOrId) {
      console.warn('Producto sin slug/id:', prod);
      return;
    }
    setResults([]);        // cierra dropdown
    setSearchTerm('');     // limpia input (opcional)
    navigate(`/products/${slugOrId}`);
  }

  // DEBUG: muestra en consola el término y # resultados
  useEffect(() => {
    console.debug('Header searchTerm:', searchTerm, 'resultsCount:', results.length);
  }, [searchTerm, results.length]);

  // Menús (igual que antes)
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
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
            ref={containerRef}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Buscar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputProps={{ 'aria-label': 'buscar productos' }}
              />
            </Search>

            {/* Dropdown de resultados */}
            { (results.length > 0 || loading) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  mt: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  borderRadius: 1,
                  zIndex: 1300,
                  width: { xs: '220px', sm: '360px' },
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {loading && (
                  <Box sx={{ p: 1 }}>Buscando...</Box>
                )}

                {!loading && results.length === 0 && (
                  <Box sx={{ p: 1 }}>No hay resultados</Box>
                )}

                {!loading && results.map(prod => {
                  const name = prod?.nombre_producto || prod?.name || prod?.titulo || 'Sin nombre';
                  const img = prod?.imagen_url || prod?.image || prod?.img || null;
                  const price = prod?.precio_producto || prod?.price || null;
                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      {img ? (
                        <img src={img} alt={name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <Box sx={{ width: 48, height: 48, backgroundColor: '#eee', borderRadius: 1 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
                        {price != null && <div style={{ fontSize: 12, color: '#666' }}>${price}</div>}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
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

      {/* Modal favoritos */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog size="lg">
          <ModalClose />
          <FavoritesModal open={openModal} onClose={() => setOpenModal(false)} />
        </ModalDialog>
      </Modal>
    </Box>
  );
}
