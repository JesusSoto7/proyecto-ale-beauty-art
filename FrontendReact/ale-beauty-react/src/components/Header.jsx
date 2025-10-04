import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart, BsCart4, BsPerson, BsBag, BsGeoAlt, BsBoxArrowRight, BsGear, BsCreditCard, BsTruck, BsArrowRepeat, BsListCheck, BsStar } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdAccountCircle, MdOutlinePayment, MdLocalShipping } from "react-icons/md";
import { RiAccountPinBoxLine, RiCouponLine } from "react-icons/ri";
import { AiOutlineOrderedList, AiOutlineHistory } from "react-icons/ai";
import { MdKeyboardArrowRight } from "react-icons/md"; // ícono de flecha
import Skeleton from "@mui/material/Skeleton"

import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import {Box, Button} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
import noImage from '../assets/images/no_image.png';

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
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { lang } = useParams();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

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

  const [selectedCategory, setSelectedCategory] = useState(null);


  const subcategories = selectedCategory?.sub_categories || [];
  

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
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://localhost:4000/api/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(t("profile.loadError"));
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
        });
      })
      .catch((err) => console.error(err));
  }, [t]);

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

  function goToCategory(item, parentCategory = null) {
    if (!item) return;

    const isSubCategory = !item.sub_categories && !!parentCategory;

    let categorySlug;
    let subCategoryId;

    if (isSubCategory) {
      // Caso: clic en una subcategoría
      categorySlug = parentCategory.slug || parentCategory.id;
      subCategoryId = item.id;
    } else {
      // Caso: clic en una categoría general
      const subCategory = item.sub_categories?.[0];
      categorySlug = item.slug || item.id;
      subCategoryId = subCategory?.id;
    }

    setShowCategories(false);

    if (subCategoryId) {
      // URL: /es/categoria/labiales/1/products
      navigate(`/${lang}/categoria/${categorySlug}/${subCategoryId}/products`);
    } else {
      // URL: /es/categoria/labiales/products
      navigate(`/${lang}/categoria/${categorySlug}/products`);
    }
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
      PaperProps={{
        style: {
          width: '320px',
          padding: '10px 0',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Encabezado del menú */}
      <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${pinkTheme.light}`, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: pinkTheme.primary }}>
          {t("header.myAccount")}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("header.personalSpace")}
        </Typography>
      </Box>
      
      {/* Perfil */}
      <MenuItem 
        onClick={() => { navigate(`/${lang}/perfil`); setAnchorEl(null); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsPerson style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.profile')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t("header.manageYourPersonalInformation")}</Typography>
        </Box>
      </MenuItem>
      
      {/* Pedidos */}
      <MenuItem 
        onClick={() => { navigate(`/${lang}/pedidos`); setAnchorEl(null); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsBag style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.myOrders')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t("header.checkYourOrders")}</Typography>
        </Box>
      </MenuItem>
      
      {/* Direcciones */}
      <MenuItem 
        onClick={() => { navigate(`/${lang}/direcciones`); setAnchorEl(null); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsGeoAlt style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.myAddresses')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t("header.manageYourAddresses")}</Typography>
        </Box>
      </MenuItem>
      {/* Divider */}
      <Box sx={{ borderBottom: `1px solid ${pinkTheme.light}`, my: 1 }} />
      
      {/* Cerrar sesión */}
      <MenuItem 
        onClick={handleLogout}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsBoxArrowRight style={{ marginRight: '12px', color: pinkTheme.dark, fontSize: '18px' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: pinkTheme.dark }}>{t('header.logout')}</Typography>
      </MenuItem>
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



  useEffect(() => {
    categories.forEach(cat => {
      const img = new Image();
      img.src = cat.imagen_url;
      cat.sub_categories?.forEach(sub => {
        const subImg = new Image();
        subImg.src = sub.imagen_url;
      });
    });
  }, [categories]);

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
              to={`/${lang}/productos`} 
              sx={{ 
                mx: 2, 
                color: 'black', 
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
                '&:hover': { color: pinkTheme.primary }
              }}
            >
              {t('header.products')}
            </Typography>
            
            {/* Enlace de categorías con menú desplegable */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => {
                setShowCategories(false);
                setHoveredCategory(null);
              }}
            >
              {/* Botón Categorías */}
              <Typography
                sx={{
                  mx: 2,
                  color: "black",
                  cursor: "pointer",
                  fontWeight: "bold",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { color: "#e60073" },
                }}
              >
                Categorías
              </Typography>

              {/* Contenedor de Menú y Submenú */}
              {showCategories && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "40px",
                    left: 0,
                    display: "flex",
                    backgroundColor: "#202020",
                    borderRadius: "5px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                    zIndex: 1300,
                  }}
                  // 🔑 Si sales del área completa, resetea
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Dropdown principal */}
                  <Box
                    sx={{
                      minWidth: "220px",
                      py: 1,
                      backgroundColor: "#202020",
                      borderRadius: "5px 0 0 5px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {categories.map((category) => {
                      const name = category?.nombre_categoria || category?.name || t("header.noName");
                      const hasSub = category.sub_categories && category.sub_categories.length > 0;

                      return (
                        <Box
                          key={category.id || category.slug}
                          onMouseEnter={() => hasSub ? setHoveredCategory(category) : setHoveredCategory(null)}
                          onClick={() => {
                            if (!hasSub) goToCategory(category);
                          }}
                          sx={{
                            px: 2,
                            py: 1.2,
                            cursor: "pointer",
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            "&:hover": {
                              backgroundColor: "#333",
                              color: "#e60073",
                            },
                          }}
                        >
                          {name}
                          {hasSub && <MdKeyboardArrowRight />}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Submenú lateral (solo si hay subcategorías) */}
                  {hoveredCategory?.sub_categories?.length > 0 && (
                    <Box
                      sx={{
                        minWidth: "50vw",
                        maxWidth: "50vw",
                        backgroundColor: "#fff",
                        color: "#202020",
                        borderRadius: "0 5px 5px 0",
                        py: 2,
                        px: 3,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 2,
                        overflowY: "auto",
                        overflowX: "hidden",
                        maxHeight: "600px",
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ gridColumn: "1 / -1", mb: 2, fontWeight: "bold", fontSize: "20px" }}
                        >
                          {hoveredCategory.nombre_categoria || hoveredCategory.name}
                        </Typography>
                        <hr style={{ border: `1px solid ${pinkTheme.primary}` }} />
                      </Box>
                      
                      <Box
                        sx={{
                          minWidth: "48vw",
                          maxWidth: "50vw",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 2,
                          overflowY: "auto",
                          maxHeight: "600px",
                          alignItems: "center",
                          justifyContent: "start",
                          justifySelf: "center",
                        }}
                      >
                        {/* Si hoveredCategory existe pero aún no tiene subcats listos → Skeleton */}
                        {!hoveredCategory?.sub_categories
                          ? Array.from(new Array(6)).map((_, index) => (
                              <Box
                                key={index}
                                sx={{
                                  maxWidth: "202px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                }}
                              >
                                <Skeleton
                                  variant="rectangular"
                                  width={200}
                                  height={200}
                                  animation="wave"
                                />
                                <Skeleton
                                  variant="text"
                                  width={120}
                                  height={30}
                                  sx={{ mx: "auto", mt: 1 }}
                                />
                              </Box>
                            ))
                          : hoveredCategory.sub_categories.map((sub) => (
                              <Box
                                key={sub.id || sub.slug}
                                onClick={() => goToCategory(sub, hoveredCategory)}
                                sx={{
                                  cursor: "pointer",
                                  maxWidth: "202px",
                                  fontSize: "14px",
                                  flexDirection: "column",
                                  display: "flex",
                                  position: "relative",
                                  overflow: "hidden",
                                  borderRadius: "6px",
                                  "&:hover img": {
                                    filter: "brightness(60%)", // oscurece la imagen
                                    transform: "scale(1.05)", // zoom suave
                                  },
                                  "&:hover .overlayText": {
                                    opacity: 1, // aparece el texto
                                  },
                                }}
                              >
                                {/* Imagen */}
                                <img
                                  src={sub.imagen_url}
                                  alt={sub.nombre_categoria || sub.nombre}
                                  width={200}
                                  height={200}
                                  style={{
                                    transition: "all 0.3s ease",
                                    objectFit: "cover",
                                  }}
                                />

                                {/* Overlay con el texto */}
                                <Box
                                  className="overlayText"
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    textAlign: "center",
                                    opacity: 0,
                                    transition: "opacity 0.3s ease",
                                    pointerEvents: "none",
                                  }}
                                >
                                  {sub.nombre_categoria || sub.nombre}
                                </Box>
                              </Box>
                            ))}
                      </Box>

                    </Box>
                  )}
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
            
            {user ? (
              <Box  
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                  backgroundColor: "#f896b8", 
                  borderRadius: '50%', 
                  width: 26, 
                  height: 26, 
                  display: 'flex', 
                  alignItems: 'center',
                  paddingTop: 0.1,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { opacity: 0.85, backgroundColor: pinkTheme.primary }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  {user.nombre?.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            ) : (
              <IconButton  
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ 
                  color: 'black', 
                  '&:hover': { color: pinkTheme.primary } 
                }}
              >
                <IoPersonCircleSharp size={30} />
              </IconButton>
            )}


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