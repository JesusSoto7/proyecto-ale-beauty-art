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

  const navigate = useNavigate();
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const DEBOUNCE_MS = 250;

  function handleSearchSubmit(e) {
    e.preventDefault();
  }

  // cerrar si clic afuera
  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (containerRef.current && !containerRef.current.contains(ev.target)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  async function fetchResults(q) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:4000/api/v1/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setResults([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
      setResults(filterAndLimit(arr, q));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function filterAndLimit(array, q) {
    const term = (q || '').toLowerCase();
    const filtered = array.filter((prod) =>
      (prod?.nombre_producto || prod?.name || '').toLowerCase().includes(term)
    );
    return filtered.slice(0, 4); // 🔹 solo 4 resultados máximo
  }

  function goToProduct(prod) {
    const slugOrId = prod?.slug || prod?.id;
    if (!slugOrId) return;
    setResults([]);
    setSearchTerm('');
    navigate(`/products/${slugOrId}`);
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    try {
      await fetch('https://localhost:4000/api/v1/sign_out', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch {}
    window.location.href = '/login';
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={() => setAnchorEl(null)}
    >
      <MenuItem onClick={() => setAnchorEl(null)}>Perfil</MenuItem>
      <MenuItem onClick={() => { navigate("/direcciones"); setAnchorEl(null); }}>
        Mis direcciones
      </MenuItem>
      <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      open={isMobileMenuOpen}
      onClose={() => setMobileMoreAnchorEl(null)}
    >
      <MenuItem onClick={(e) => setAnchorEl(e.currentTarget)}>
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
          <Link to="/inicio">
            <img src={logo} alt="Logo" style={{ height: 40, borderRadius: 20 }} />
          </Link>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 3 }}>
            <Typography component={Link} to="/inicio" sx={{ mx: 2, color: 'black', textDecoration: 'none' }}>INICIO</Typography>
            <Typography component={Link} to="/products" sx={{ mx: 2, color: 'black', textDecoration: 'none' }}>PRODUCTOS</Typography>
          </Box>

          {/* Buscador */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
            ref={containerRef}
          >
            <Search>
              <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
              <StyledInputBase
                placeholder="Buscar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Search>

            {/* Dropdown resultados */}
            {(results.length > 0 || loading) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  bgcolor: 'white',
                  boxShadow: 3,
                  borderRadius: 2,
                  zIndex: 1300,
                  width: '90%',
                  mx: 'auto',
                  p: 2,
                }}
              >
                {loading && <Box sx={{ p: 1 }}>Buscando...</Box>}

                {!loading && results.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)', // 🔹 siempre 4 columnas
                      gap: 2,
                    }}
                  >
                    {results.map((prod) => {
                      const name = prod?.nombre_producto || prod?.name || 'Sin nombre';
                      const img = prod?.imagen_url || prod?.image || null;
                      const price = prod?.precio_producto || prod?.price || null;
                      return (
                        <Box
                          key={prod.id || prod.slug || name}
                          onClick={() => goToProduct(prod)}
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            borderRadius: 2,
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 4 },
                          }}
                        >
                          {img ? (
                            <img src={img} alt={name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                          ) : (
                            <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1 }} />
                          )}
                          <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>{name}</Typography>
                          {price && <Typography variant="caption" color="text.secondary">${price}</Typography>}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Íconos */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><IoPersonCircleSharp size={30} /></IconButton>
            <IconButton component={Link} to="/carrito"><BsCart4 size={25} /></IconButton>
            <IconButton onClick={() => setOpenModal(true)}><BsHeart size={22} /></IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}><MoreIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog size="lg">
          <ModalClose />
          <FavoritesModal open={openModal} onClose={() => setOpenModal(false)} />
        </ModalDialog>
      </Modal>
    </Box>
  );
}
