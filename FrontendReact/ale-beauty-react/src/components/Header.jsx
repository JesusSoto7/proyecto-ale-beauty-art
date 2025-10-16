import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart, BsCart4, BsPerson, BsBag, BsGeoAlt, BsBoxArrowRight, BsGear, BsCreditCard, BsTruck, BsArrowRepeat, BsListCheck, BsBell } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdAccountCircle, MdOutlinePayment, MdLocalShipping } from "react-icons/md";
import { RiAccountPinBoxLine, RiCouponLine } from "react-icons/ri";
import { AiOutlineOrderedList, AiOutlineHistory } from "react-icons/ai";
import { MdKeyboardArrowRight } from "react-icons/md";
import Skeleton from "@mui/material/Skeleton"

import AppBar from '@mui/material/AppBar';
import {Box, Button, Badge, Select, MenuItem, FormControl} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Menu from '@mui/material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import noImage from '../assets/images/no_image.png';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import FavoritesModal from './FavoritesModal';
import SearchBar from "./SearchBar";

// Paleta de colores rosa
const pinkTheme = {
  primary: '#e91e63',
  secondary: '#f8bbd0',
  dark: '#ad1457',
  light: '#fce4ec',
  background: '#fff5f7'
};

export default function Header({ loadFavorites }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredNavCategory, setHoveredNavCategory] = useState(null);
  const { lang } = useParams();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const SCROLL_THRESHOLD = 100;

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  const navigate = useNavigate();
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const containerRef = useRef(null);
  const categoriesRef = useRef(null);
  const navCategoriesRef = useRef(null);
  const debounceRef = useRef(null);
  const DEBOUNCE_MS = 250;
  const cartCount = Array.isArray(cart?.products)
    ? cart.products.reduce((acc, p) => acc + (p.cantidad || 1), 0)
    : 0;

  const [selectedCategory, setSelectedCategory] = useState(null);

  const subcategories = selectedCategory?.sub_categories || [];
  const token = localStorage.getItem('token');
  
  // Función para cambiar idioma
  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    
    // Actualizar la URL manteniendo la misma ruta
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${lang}/`, `/${newLang}/`);
    navigate(newPath);
  };

  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdatedCustom", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdatedCustom", handleCartUpdate);
    };
  }, [token]);

  const fetchCart = () => {
    setLoading(true);
    setError(null);
    fetch("https://localhost:4000/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => setCart(data))
      .catch((err) => {
        console.error("Error cargando cart: ", err);
        setError(t("cart.loadingError"));
      })
      .finally(() => setLoading(false));
  };

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
      if (navCategoriesRef.current && !navCategoriesRef.current.contains(ev.target)) {
        setHoveredNavCategory(null);
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
      })
      .catch((err) => console.error(err));
  }, [t]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    try {
      await fetch('https://localhost:4000/api/v1/sign_out', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch { }
    window.location.href = `/${lang}/login`;
  };

  // Función para navegar a categorías
  function goToCategory(item, parentCategory = null) {
    if (!item) return;

    const isSubCategory = !item.sub_categories && !!parentCategory;
    let categorySlug;
    let subCategorySlug;

    if (isSubCategory) {
      categorySlug = parentCategory.slug || parentCategory.id;
      subCategorySlug = item.slug || item.id;
    } else {
      const subCategory = item.sub_categories?.[0];
      categorySlug = item.slug || item.id;
      subCategorySlug = subCategory?.slug || subCategory?.id;
    }

    setShowCategories(false);
    setHoveredNavCategory(null);

    if (subCategorySlug) {
      navigate(`/${lang}/categoria/${categorySlug}/${subCategorySlug}/products`);
    } else {
      navigate(`/${lang}/categoria/${categorySlug}`);
    }
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
      <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${pinkTheme.light}`, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: pinkTheme.primary }}>
          {t("header.myAccount")}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("header.personalSpace")}
        </Typography>
      </Box>
      
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
      
      <Box sx={{ borderBottom: `1px solid ${pinkTheme.light}`, my: 1 }} />
      
      <MenuItem 
        onClick={handleLogout}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsBoxArrowRight style={{ marginRight: '12px', color: pinkTheme.dark, fontSize: '18px' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: pinkTheme.dark }}>{t('header.logout')}</Typography>
      </MenuItem>
    </Menu>
  );

  const perfilIcon = user ? (
    <Box
      onClick={(e) => setAnchorEl(e.currentTarget)}
      sx={{
        backgroundColor: "#f896b8",
        borderRadius: "50%",
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        paddingTop: 0.1,
        alignSelf: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": { opacity: 0.85, backgroundColor: pinkTheme.primary },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {user.nombre?.charAt(0).toUpperCase()}
      </Typography>
    </Box>
  ) : (
    <IconButton
      onClick={(e) => setAnchorEl(e.currentTarget)}
      sx={{
        color: "black",
        "&:hover": { color: pinkTheme.primary },
      }}
    >
      <IoPersonCircleSharp size={30} />
    </IconButton>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      open={isMobileMenuOpen}
      onClose={() => setMobileMoreAnchorEl(null)}
    >
      <MenuItem onClick={(e) => setAnchorEl(e.currentTarget)}>
        {perfilIcon}
        <p style={{ marginLeft: 10, marginBottom: 0 }}>{t('header.profile')}</p>
      </MenuItem>
      <MenuItem component={Link} to={`/${lang}/carrito`}>
        <BsCart4 size={22} />
        <p style={{ marginLeft: 10, marginBottom: 0 }}>{t('header.cart')}</p>
      </MenuItem>
      <MenuItem onClick={() => setOpenModal(true)}>
        <BsHeart size={20} />
        <p style={{ marginLeft: 10, marginBottom: 0 }}>{t('header.favorites')}</p>
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
    <>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header Principal */}
        <AppBar className={`header ${scrolled ? 'scrolled' : ''}`} position="fixed" color="inherit" >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            {/* Logo a la izquierda */}
            <Link to={`/${lang}/inicio`}>
              <img src={logo} alt="Logo" style={{ height: 40, borderRadius: 20 }} />
            </Link>
            <Typography variant="h6" noWrap component={Link} to={`/${lang}/inicio`}
              sx={{
                display: { xs: 'none', sm: 'block', textDecoration: 'none', color: '#f93f9fff', fontWeight: 'bold', marginLeft: -100, fontSize: 30 }
              }}>
              Ale Beauty Art
            </Typography>

            {/* Barra de búsqueda en el centro */}
            <Box sx={{ 
              flex: 1, 
              maxWidth: '700px', 
              mx: 3,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <SearchBar />
            </Box>

            {/* Íconos a la derecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Selector de idioma */}
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={lang || 'es'}
                  onChange={handleLanguageChange}
                  sx={{
                    fontSize: '14px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: pinkTheme.primary,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: pinkTheme.primary,
                    }
                  }}
                >
                  <MenuItem value="es">🇪🇸 ES</MenuItem>
                  <MenuItem value="en">🇺🇸 EN</MenuItem>
                </Select>
              </FormControl>

              {/* Icono de perfil */}
              {perfilIcon}

              {/* Nombre del usuario */}
              <Typography 
                component={Link} 
                to={user ? `/${lang}/perfil` : `/${lang}/login`}
                sx={{ 
                  color: 'black', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  display: { xs: 'none', sm: 'block' },
                  transition: 'color 0.2s',
                  '&:hover': { color: pinkTheme.primary }
                }}
              >
                {user ? user.nombre : 'Sign In'}
              </Typography>

              {/* Carrito */}
              <IconButton
                component={Link}
                to={`/${lang}/carrito`}
                sx={{ color: "black", "&:hover": { color: pinkTheme.primary } }}
              >
                <Badge
                  badgeContent={cartCount}
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: pinkTheme.primary,
                      border: "solid 1px white",
                      fontSize: "0.7rem",
                      height: "16px",
                      minWidth: "16px",
                      top: 4,
                      right: 4,
                    },
                  }}
                >
                  <BsCart4 size={25} />
                </Badge>
              </IconButton>

              {/* Favoritos */}
              <IconButton
                onClick={() => setOpenModal(true)}
                sx={{ color: "black", "&:hover": { color: pinkTheme.primary } }}
              >
                <BsHeart size={22} />
              </IconButton>

              {/* Notificaciones - Icono de campana */}
              <IconButton
                sx={{ color: "black", "&:hover": { color: pinkTheme.primary }}}
                >
                  <Badge
                    badgeContent={0} // Puedes cambiar esto por el número real de notificaciones
                    color="error"
                    overlap="circular"
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: pinkTheme.primary,
                        border: "solid 1px white",
                        fontSize: "0.7rem",
                        height: "16px",
                        minWidth: "16px",
                        top: 4,
                        right: 4,
                      },
                    }}
                  >
                    <BsBell size={22}/>
                  </Badge>
               </IconButton>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            </Box>
          </Toolbar>

          {/* Barra negra con categorías dinámicas */}
          <Box 
            ref={navCategoriesRef}
            sx={{ 
              backgroundColor: '#df6897ff',
              color: 'white',
              py: 1,
              px: 2,
              position: 'relative'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap',
                position: 'relative'
              }}
            >
              {/* ENLACE A PRODUCTOS */}
              <Typography 
                component={Link} 
                to={`/${lang}/productos`}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                  color: 'white',
                  '&:hover': { color: pinkTheme.secondary }
                }}
              >
                {t('header.products')}  |
              </Typography>

              {/* Categorías dinámicas desde la API */}
              {categories.map((category) => {
                const categoryName = category?.nombre_categoria || category?.name || 'Categoría';
                const hasSubcategories = category.sub_categories && category.sub_categories.length > 0;
                
                return (
                  <Box
                    key={category.id || category.slug}
                    sx={{ 
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredNavCategory(hasSubcategories ? category : null)}
                    onMouseLeave={() => {
                      setTimeout(() => {
                        if (!document.querySelector('.nav-category-dropdown:hover')) {
                          setHoveredNavCategory(null);
                        }
                      }, 100);
                    }}
                    onClick={() => !hasSubcategories && goToCategory(category)}
                  >
                    <Typography 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        transition: 'color 0.2s',
                        '&:hover': { color: pinkTheme.secondary },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {categoryName}
                      {hasSubcategories && (
                        <MdKeyboardArrowRight size={16} />
                      )}
                    </Typography>

                    {/* Dropdown de subcategorías - CENTRADO */}
                    {hoveredNavCategory?.id === category.id && hasSubcategories && (
                      <Box
                        className="nav-category-dropdown"
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          borderRadius: '5px',
                          zIndex: 1300,
                          minWidth: '70vw',
                          maxWidth: '90vw',
                          mt: 1,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid #fff',
                          }
                        }}
                        onMouseEnter={() => setHoveredNavCategory(category)}
                        onMouseLeave={() => setHoveredNavCategory(null)}
                      >
                        {/* Submenú lateral con imágenes */}
                        {hoveredNavCategory?.sub_categories?.length > 0 && (
                          <Box
                            sx={{
                              minWidth: '50vw',
                              maxWidth: '50vw',
                              backgroundColor: '#fff',
                              color: '#202020',
                              borderRadius: '5px',
                              py: 4,
                              px: 5,
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
                              overflowY: 'auto',
                              maxHeight: '600px',
                            }}
                          >
                            {/* Título */}
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 2,
                                fontWeight: 'bold',
                                fontSize: '22px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: '#202020',
                              }}
                            >
                              {hoveredNavCategory.nombre_categoria || hoveredNavCategory.name}
                            </Typography>
                            <Box
                              sx={{
                                width: '50px',
                                height: '3px',
                                backgroundColor: '#e60073',
                                mb: 3,
                                borderRadius: '2px',
                              }}
                            />

                            {/* Subcategorías con imágenes */}
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 3,
                                justifyContent: 'start',
                              }}
                            >
                              {!hoveredNavCategory?.sub_categories
                                ? Array.from(new Array(6)).map((_, index) => (
                                    <Box
                                      key={index}
                                      sx={{
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        maxWidth: '250px',
                                      }}
                                    >
                                      <Skeleton
                                        variant="rectangular"
                                        width={250}
                                        height={200}
                                        animation="wave"
                                        sx={{ borderRadius: '8px' }}
                                      />
                                      <Skeleton
                                        variant="text"
                                        width={150}
                                        height={30}
                                        sx={{ mx: 'auto', mt: 1 }}
                                      />
                                    </Box>
                                  ))
                                : hoveredNavCategory.sub_categories.map((sub) => (
                                    <Box
                                      key={sub.id || sub.slug}
                                      onClick={() => goToCategory(sub, hoveredNavCategory)}
                                      sx={{
                                        cursor: 'pointer',
                                        maxWidth: '250px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          transform: 'translateY(-3px)',
                                        },
                                        '&:hover img': {
                                          filter: 'brightness(70%)',
                                          transform: 'scale(1.05)',
                                        },
                                        '&:hover .overlayText': {
                                          opacity: 1,
                                        },
                                      }}
                                    >
                                      {/* Imagen */}
                                      <img
                                        src={sub.imagen_url || noImage}
                                        alt={sub.nombre_categoria || sub.nombre}
                                        width="100%"
                                        height="200px"
                                        style={{
                                          objectFit: 'cover',
                                          transition: 'all 0.3s ease',
                                        }}
                                      />

                                      {/* Overlay con texto */}
                                      <Box
                                        className="overlayText"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: '#fff',
                                          fontWeight: 'bold',
                                          fontSize: '16px',
                                          background:
                                            'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
                                          textTransform: 'uppercase',
                                          opacity: 0,
                                          transition: 'opacity 0.3s ease',
                                          pointerEvents: 'none',
                                        }}
                                      >
                                        {sub.nombre_categoria || sub.nombre}
                                      </Box>

                                      {/* Nombre debajo */}
                                      <Typography
                                        sx={{
                                          mt: 1.5,
                                          fontSize: '15px',
                                          fontWeight: 500,
                                          color: '#202020',
                                          textTransform: 'capitalize',
                                        }}
                                      >
                                        {sub.nombre_categoria || sub.nombre}
                                      </Typography>
                                    </Box>
                                  ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
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

      {/* Espaciador para el contenido debajo del header */}
      <Box sx={{ height: '100px' }} />
    </>
  );
}