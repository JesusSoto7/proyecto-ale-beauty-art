import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { formatCOP } from '../services/currency';

// Paleta de colores rosa
const pinkTheme = {
  primary: '#e91e63',
  secondary: '#f8bbd0',
  dark: '#ad1457',
  light: '#fce4ec',
  background: '#fff5f7'
};

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  border: '1px solid #ccc',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(2),
  transition: 'all 0.3s ease',
  width: '160px',
  [theme.breakpoints.up('sm')]: {
    width: '200px',
  },
  '&:focus-within': {
    width: '260px',
    [theme.breakpoints.up('sm')]: {
      width: '320px',
    },
  },
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
    transition: theme.transitions.create(['width', 'padding'], {
      duration: theme.transitions.duration.short,
    }),
    width: '100%',
  },
}));

export default function Header({ loadFavorites }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const { lang } = useParams();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const containerRef = useRef(null);
  const categoriesRef = useRef(null);
  const debounceRef = useRef(null);
  const DEBOUNCE_MS = 250;

  // Obtener categorías desde el backend
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:4000/api/v1/categories', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (res.ok) {
        const data = await res.json();
        // Ajusta según la estructura de tu API
        const categoriesArray = Array.isArray(data) ? 
          data : 
          Array.isArray(data.categories) ? 
          data.categories : 
          [];
        
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Cerrar dropdown de categorías si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (containerRef.current && !containerRef.current.contains(ev.target)) {
        setResults([]);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(ev.target)) {
        setShowCategories(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
  }

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
    return filtered.slice(0, 4);
  }

  function goToProduct(prod) {
    const slugOrId = prod?.slug || prod?.id;
    if (!slugOrId) return;
    setResults([]);
    setSearchTerm('');
    setOpenModal(false);
    navigate(`/${lang}/producto/${slugOrId}`);
  }

  function goToCategory(category) {
    const slugOrId = category?.slug || category?.id;
    if (!slugOrId) return;
    setShowCategories(false);
    navigate(`/${lang}/categoria/${slugOrId}`);
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    try {
      await fetch('https://localhost:4000/api/v1/sign_out', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch { }
    window.location.href = `/${lang}/login`;
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={() => setAnchorEl(null)}
    >
      <MenuItem onClick={() => { navigate(`/${lang}/perfil`); setAnchorEl(null); }}>
        {t('header.profile')}
      </MenuItem>
      <MenuItem onClick={() => { navigate(`/${lang}/pedidos`); setAnchorEl(null); }}>
        {t('header.myOrders')}
      </MenuItem>

      <MenuItem onClick={() => { navigate(`/${lang}/direcciones`); setAnchorEl(null); }}>
        {t('header.myAddresses')}
      </MenuItem>
      <MenuItem onClick={handleLogout}>{t('header.logout')}</MenuItem>
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
        <p style={{ marginLeft: 10 }}>{t('header.profile')}</p>
      </MenuItem>
      <MenuItem component={Link} to={`/${lang}/carrito`}>
        <BsCart4 size={22} />
        <p style={{ marginLeft: 10 }}>{t('header.cart')}</p>
      </MenuItem>
      <MenuItem onClick={() => setOpenModal(true)}>
        <BsHeart size={20} />
        <p style={{ marginLeft: 10 }}>{t('header.favorites')}</p>
      </MenuItem>
    </Menu>
  );

  // Función para calcular el número de columnas según la cantidad de categorías
  const getCategoryColumns = () => {
    if (categories.length <= 7) return 1;
    if (categories.length <= 14) return 2;
    return 3;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Link to={`/${lang}/inicio`}>
            <img src={logo} alt="Logo" style={{ height: 40, borderRadius: 20 }} />
          </Link>

          <Box sx={{ display: { xs: 'none', sm: 'flex' }, ml: 3, position: 'relative' }}>
            <Typography 
              component={Link} 
              to={`/${lang}/inicio`} 
              sx={{ 
                mx: 2, 
                color: 'black', 
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'color 0.2s',
                '&:hover': { color: pinkTheme.primary }
              }}
            >
              {t('header.home')}
            </Typography>
            <Typography 
              component={Link} 
              to={`/${lang}/productos`} 
              sx={{ 
                mx: 2, 
                color: 'black', 
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'color 0.2s',
                '&:hover': { color: pinkTheme.primary }
              }}
            >
              {t('header.products')}
            </Typography>
            
            {/* Enlace de categorías con menú desplegable */}
            <Box 
              ref={categoriesRef}
              sx={{ position: 'relative' }}
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Typography 
                sx={{ 
                  mx: 2, 
                  color: 'black', 
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'color 0.2s',
                  '&:hover': { color: pinkTheme.primary }
                }}
              >
                {t('header.categories')}
              </Typography>
              
              {/* Menú desplegable de categorías - SOLO TUS CATEGORÍAS */}
              {showCategories && categories.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    zIndex: 1300,
                    minWidth: '250px',
                    maxWidth: categories.length > 7 ? '500px' : '300px',
                    py: 2,
                    px: 2,
                    border: `2px solid ${pinkTheme.light}`
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: pinkTheme.primary,
                      mb: 2,
                      textAlign: 'center'
                    }}
                  >
                    {t('header.allCategories')}
                  </Typography>

                  <Box sx={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: pinkTheme.light,
                      borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: pinkTheme.primary,
                      borderRadius: '3px'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: `repeat(${getCategoryColumns()}, 1fr)`,
                      gap: '8px',
                    }}>
                      {categories.map((category) => {
                        const name = category?.nombre_categoria || category?.name || t('header.noName');
                        return (
                          <Box
                            key={category.id || category.slug || name}
                            onClick={() => goToCategory(category)}
                            sx={{
                              py: 1.5,
                              color: 'text.primary',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: pinkTheme.primary
                              }
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'center'
                              }}
                            >
                              {name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
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
                placeholder={t('header.searchPlaceholder')}
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
                {loading && <Box sx={{ p: 1 }}>{t('header.searching')}</Box>}

                {!loading && results.length > 0 && (
                  <>
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'grid' },
                        gridTemplateColumns: {
                          sm: 'repeat(2, 1fr)',
                          md: 'repeat(3, 1fr)',
                          lg: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                      }}
                    >
                      {results.map((prod) => {
                        const name = prod?.nombre_producto || prod?.name || t('header.noName');
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
                              '&:hover': { 
                                boxShadow: 4,
                                borderColor: pinkTheme.primary
                              },
                            }}
                          >
                            {img ? (
                              <img src={img} alt={name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                              <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>{name}</Typography>
                            {price && (
                              <Typography variant="caption" sx={{ color: pinkTheme.primary, fontWeight: 'bold' }}>
                                {formatCOP(price)}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    <Box
                      sx={{
                        display: { xs: 'flex', sm: 'none' },
                        overflowX: 'auto',
                        gap: 2,
                        pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                      }}
                    >
                      {results.map((prod) => {
                        const name = prod?.nombre_producto || prod?.name || t('header.noName');
                        const img = prod?.imagen_url || prod?.image || null;
                        const price = prod?.precio_producto || prod?.price || null;
                        return (
                          <Box
                            key={prod.id || prod.slug || name}
                            onClick={() => goToProduct(prod)}
                            sx={{
                              minWidth: 160,
                              maxWidth: 200,
                              p: 1,
                              textAlign: 'center',
                              border: '1px solid #ddd',
                              borderRadius: 2,
                              cursor: 'pointer',
                              flexShrink: 0,
                              '&:hover': { 
                                boxShadow: 4,
                                borderColor: pinkTheme.primary
                              },
                            }}
                          >
                            {img ? (
                              <img src={img} alt={name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                            ) : (
                              <Box sx={{ width: '100%', height: 120, bgcolor: '#eee', borderRadius: 1 }} />
                            )}
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>{name}</Typography>
                            {price && (
                              <Typography variant="caption" sx={{ color: pinkTheme.primary, fontWeight: 'bold' }}>
                                {formatCOP(price)}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* Íconos */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <IconButton 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
            >
              <IoPersonCircleSharp size={30} />
            </IconButton>
            <IconButton 
              component={Link} 
              to={`/${lang}/carrito`}
              sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
            >
              <BsCart4 size={25} />
            </IconButton>
            <IconButton 
              onClick={() => setOpenModal(true)}
              sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
            >
              <BsHeart size={22} />
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMobileMenu}
      {renderMenu}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog size="lg">
          <ModalClose />
          <FavoritesModal 
            open={openModal} 
            onClose={() => {
              setOpenModal(false);
              loadFavorites();
            }} 
          />
        </ModalDialog>
      </Modal>
    </Box>
  );
}