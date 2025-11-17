import React, { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart, BsCart4, BsBell, BsGlobe } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";

import AppBar from '@mui/material/AppBar';
import { Box, Badge, Select, MenuItem, FormControl, useMediaQuery } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import FavoritesModal from './FavoritesModal';
import SearchBar from "./SearchBar";

// Hooks personalizados
import { useCartState } from './hooks/useCartState';
import { useNotifications } from './hooks/useNotifications';
import { useUserAuth } from './hooks/useUserAuth';
import { useCategories } from './hooks/useCategories';
import { useScrollState } from './hooks/useScrollState';

// Componentes separados
import UserMenu from './UserMenu';
import NotificationsMenu from './NotificationsMenu';
import CategoryNav from './CategoryNav';

const pinkTheme = {
  primary: '#e91e63',
  secondary: '#f8bbd0',
  dark: '#ad1457',
  light: '#fce4ec',
  background: '#fff5f7'
};

export default function Header({ loadFavorites }) {
  const { lang } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  // Responsive width queries for overflow management
  const isMidRange = useMediaQuery('(min-width:900px) and (max-width:1419px)');
  const isLarge = useMediaQuery('(min-width:1420px)');
  // Rango ajustado 915–1279px: en 1280+ hay espacio para todos los íconos (sin hamburguesa)
  const isDesktopMidSpan = useMediaQuery('(min-width:915px) and (max-width:1279px)');
  // Usado para controlar visibilidad de hamburguesa y comportamiento específico a partir de 768px
  const isMdUp = useMediaQuery('(min-width:768px)');
  // Banda fina 900–930px (alrededor de 912px) para compactar espacios del nombre
  const isNarrowDesktop = useMediaQuery('(min-width:900px) and (max-width:930px)');
  // Breakpoints progresivos para ir sacando ítems del menú hamburguesa en móviles
  // Ajustados para evitar saturación entre 601 y 844
  const showLanguage = useMediaQuery('(min-width:520px)');
  const showProfileIcon = useMediaQuery('(min-width:560px)');
  const showUserName = useMediaQuery('(min-width:650px)');
  const showCart = useMediaQuery('(min-width:700px)');
  const showFavorites = useMediaQuery('(min-width:760px)');
  const showNotifications = useMediaQuery('(min-width:820px)');
  const allPromoted = showLanguage && showProfileIcon && showUserName && showCart && showFavorites && showNotifications;
  // Modo hamburguesa extendido: cuando todavía faltan ítems O estamos en mid-span limitado (<1420 y rango 915–1418)
  const inHamburgerMode = (!isLarge) && (!allPromoted || isDesktopMidSpan);
  // Hamburguesa visible sólo cuando realmente debe mostrarse: <768 o en 915–1418
  const isHamburgerVisible = inHamburgerMode && (!isMdUp || isDesktopMidSpan);
  // Media queries para ajustar título y barra de búsqueda evitando que oculten íconos/hamburguesa
  const isLt360 = useMediaQuery('(max-width:359px)');
  const isLt480 = useMediaQuery('(max-width:479px)');
  const isLt600 = useMediaQuery('(max-width:599px)');
  const isLt720 = useMediaQuery('(max-width:719px)');
  const isLt845 = useMediaQuery('(max-width:844px)');
  const isLt760 = useMediaQuery('(max-width:759px)');
  const isLt800 = useMediaQuery('(max-width:799px)');
  const is800to845 = useMediaQuery('(min-width:800px) and (max-width:845px)');
  let titleFontSize = '1.9rem';
  if (isLt845) titleFontSize = '1.45rem';
  if (isLt800) titleFontSize = '1.35rem';
  if (isLt720) titleFontSize = '1.3rem';
  if (isLt600) titleFontSize = '1.2rem';
  if (isLt480) titleFontSize = '1.1rem';
  if (isLt360) titleFontSize = '1.0rem';
  let searchBarMaxWidth = '600px';
  if (isMidRange) searchBarMaxWidth = '500px';
  if (isLt845) searchBarMaxWidth = '340px';
  if (is800to845) searchBarMaxWidth = '280px';
  if (isLt800) searchBarMaxWidth = '300px';
  if (isLt720) searchBarMaxWidth = '270px';
  if (isLt600) searchBarMaxWidth = '240px';
  if (isLt480) searchBarMaxWidth = '205px';
  if (isLt360) searchBarMaxWidth = '180px';
  
  // Estados locales
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  
  // Refs
  const navCategoriesRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  // ✅ Custom hooks
  const { cart, cartCount } = useCartState(token, t);
  const { user, handleLogout } = useUserAuth(t);
  const { 
    categories, 
    hoveredNavCategory, 
    setHoveredNavCategory 
  } = useCategories();
  const scrolled = useScrollState(100);
  const {
    notificationsAnchorEl,
    isNotificationsMenuOpen,
    notificaciones,
    notificacionesLoading,
    noLeidas,
    handleOpenNotificationsMenu,
    handleCloseNotificationsMenu,
    formatNotificationTime
  } = useNotifications(token);

  // Función para cambiar idioma
  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${lang}/`, `/${newLang}/`);
    navigate(newPath);
  };

  // Función para navegar a categorías
  function goToCategory(item, parentCategory = null) {
    if (!item) return;

    const isSubCategory = !item.sub_categories && !!parentCategory;
    let categorySlug, subCategorySlug;

    if (isSubCategory) {
      categorySlug = parentCategory.slug || parentCategory.id;
      subCategorySlug = item.slug || item.id;
    } else {
      const subCategory = item.sub_categories?.[0];
      categorySlug = item.slug || item.id;
      subCategorySlug = subCategory?.slug || subCategory?.id;
    }

    setHoveredNavCategory(null);

    if (subCategorySlug) {
      navigate(`/${lang}/categoria/${categorySlug}/${subCategorySlug}/products`);
    } else {
      navigate(`/${lang}/categoria/${categorySlug}`);
    }
  }

  // Icono de perfil
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
      <Typography variant="caption" sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>
        {user.nombre?.charAt(0).toUpperCase()}
      </Typography>
    </Box>
  ) : (
    <IconButton
      onClick={(e) => setAnchorEl(e.currentTarget)}
      sx={{ color: "black", "&:hover": { color: pinkTheme.primary } }}
    >
      <IoPersonCircleSharp size={30} />
    </IconButton>
  );

  // Menú móvil
  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={() => setMobileMoreAnchorEl(null)}
      className="mobile-menu"
    >
      {/* Perfil (solo si no salió al header) */}
      {!(showProfileIcon || showUserName) && (
        <MenuItem
          component={Link}
          to={user ? `/${lang}/perfil` : `/${lang}/login`}
          onClick={() => setMobileMoreAnchorEl(null)}
          className="mobile-menu-item"
        >
          <IoPersonCircleSharp />
          {user ? t('header.profile','Perfil') : t('header.signIn','Iniciar sesión')}
        </MenuItem>
      )}

      {/* Carrito (en mid-span también va al menú) */}
      {(!showCart || isDesktopMidSpan) && (
        <MenuItem 
          component={Link} 
          to={`/${lang}/carrito`}
          onClick={() => setMobileMoreAnchorEl(null)}
          className="mobile-menu-item"
        >
          <BsCart4 />
          {t('header.cart','Carrito')}
          <Badge badgeContent={cartCount} color="error" sx={{ marginLeft: 'auto' }} className="mobile-menu-badge" />
        </MenuItem>
      )}

      {/* Favoritos (en mid-span también va al menú) */}
      {(!showFavorites || isDesktopMidSpan) && (
        <MenuItem 
          onClick={() => {
            setOpenModal(true);
            setMobileMoreAnchorEl(null);
          }}
          className="mobile-menu-item"
        >
          <BsHeart />
          {t('header.favorites','Favoritos')}
        </MenuItem>
      )}

      {/* Idioma (no duplicar en mid-span, ya está en header) */}
      {!showLanguage && !isDesktopMidSpan && (
        <MenuItem className="mobile-menu-item">
          <BsGlobe />
          <FormControl size="small" sx={{ minWidth: 80, ml: 1 }}>
            <Select
              value={lang || 'es'}
              onChange={(e) => {
                setMobileMoreAnchorEl(null);
                handleLanguageChange(e);
              }}
              sx={{
                fontSize: '14px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: pinkTheme.primary },
              }}
            >
              <MenuItem value="es">🇪🇸 ES</MenuItem>
              <MenuItem value="en">🇺🇸 EN</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      )}

      {/* Notificaciones (en mid-span también va al menú) */}
      {(!showNotifications || isDesktopMidSpan) && (
        <MenuItem 
          onClick={() => {
            if (hamburgerBtnRef.current) {
              handleOpenNotificationsMenu({ currentTarget: hamburgerBtnRef.current });
            } else {
              handleOpenNotificationsMenu({ currentTarget: null });
            }
            setMobileMoreAnchorEl(null);
          }}
          className="mobile-menu-item"
        >
          <BsBell />
          {t('header.notifications','Notificaciones')}
          <Badge badgeContent={noLeidas} color="error" sx={{ marginLeft: 'auto' }} className="mobile-menu-badge" />
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar className={`header ${scrolled ? 'scrolled' : ''}`} position="fixed" color="inherit">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            {/* ✅ LOGO + TÍTULO JUNTOS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Link to={`/${lang}/inicio`} style={{ display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="Logo" style={{ height: 40, borderRadius: 20 }} />
              </Link>
              
              <Typography 
                variant="h6" 
                noWrap 
                component={Link} 
                to={`/${lang}/inicio`}
                sx={{
                  display: { xs: 'none', sm: (isLt800 ? 'none' : 'block'), md: 'block' },
                  textDecoration: 'none',
                  color: '#df6eacff',
                  fontWeight: 'bold',
                  fontSize: titleFontSize,
                  letterSpacing: '0.5px',
                  transition: 'color 0.2s',
                  mr: 1.2,
                  '&:hover': {
                    color: pinkTheme.primary
                  }
                }}
              >
                Ale Beauty Art
              </Typography>
            </Box>
            {/* Barra de búsqueda */}
            <Box
              className="search-bar-container"
              sx={{ 
                flex: 1, 
                maxWidth: searchBarMaxWidth,
                mx: 3, 
                minWidth: 0,
                flexShrink: 1,
                display: 'flex', 
                justifyContent: 'center',
                pr: isLt800 ? 0.5 : 1,
                pl: isLt800 ? 0.5 : 1
              }}
            >
              <SearchBar />
            </Box>

            {/* Íconos */}
            {/* Desktop / Mid-range icons. Some items hidden on mid-range to prevent overflow. */}
            {/* Íconos desktop y mid (≥900px). En el rango 915–1418 no ocultar íconos si hay espacio. */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {/* Selector de idioma */}
              {(showLanguage || isLarge) && (
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={lang || 'es'}
                    onChange={handleLanguageChange}
                    sx={{
                      fontSize: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: pinkTheme.primary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: pinkTheme.primary }
                    }}
                  >
                    <MenuItem value="es">🇪🇸 ES</MenuItem>
                    <MenuItem value="en">🇺🇸 EN</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Perfil */}
              {perfilIcon}

              {/* Nombre (oculto en mid-span para dejar sólo idioma + perfil) */}
              {(showUserName || isLarge) && !isDesktopMidSpan && (
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
                    '&:hover': { color: pinkTheme.primary },
                    // Evitar reservar ancho: quitar espacio extra a la derecha
                    minWidth: 0,
                    maxWidth: isNarrowDesktop ? '64px' : 'none',
                    ml: isNarrowDesktop ? 0 : 1,
                    whiteSpace: isNarrowDesktop ? 'nowrap' : undefined,
                    overflow: isNarrowDesktop ? 'hidden' : undefined,
                    textOverflow: isNarrowDesktop ? 'ellipsis' : undefined
                  }}
                >
                  {user ? user.nombre : 'Sign In'}
                </Typography>
              )}

              {/* Íconos adicionales ocultos en mid-span (se moverán a hamburguesa). */}
              {!isDesktopMidSpan && (
                <>
                  {/* Carrito con optimistic count */}
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
                  {(showFavorites || isLarge) && (
                    <IconButton
                      onClick={() => setOpenModal(true)}
                      sx={{ color: "black", "&:hover": { color: pinkTheme.primary } }}
                    >
                      <BsHeart size={22} />
                    </IconButton>
                  )}
                  {/* Notificaciones */}
                  <IconButton
                    sx={{ color: "black", "&:hover": { color: pinkTheme.primary }}}
                    onClick={(e) => handleOpenNotificationsMenu(e)}
                  >
                    <Badge
                      badgeContent={noLeidas}
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
                </>
              )}
            </Box>

            {/* Íconos progresivos (móviles y md) con hamburguesa única */}
            {/* Íconos progresivos/hamburguesa para tamaños <900px o cuando aún no se promueven todos */}
            <Box sx={{ display: { xs: 'flex', md: inHamburgerMode ? 'flex' : 'none' }, alignItems: 'center', gap: 0.7, flexShrink: 0 }}>
              {showLanguage && !isDesktopMidSpan && (
                <FormControl size="small" sx={{ minWidth: isLt760 ? 50 : 62, ml: isLt760 ? 0.4 : 0.8 }}>
                  <Select
                    value={lang || 'es'}
                    onChange={handleLanguageChange}
                    sx={{
                      fontSize: isLt760 ? '10.5px' : '11.5px',
                      '& .MuiSelect-select': { padding: isLt760 ? '3px 22px 3px 7px' : '5px 24px 5px 9px' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: pinkTheme.primary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: pinkTheme.primary }
                    }}
                  >
                    <MenuItem value="es">ES</MenuItem>
                    <MenuItem value="en">EN</MenuItem>
                  </Select>
                </FormControl>
              )}
              {showProfileIcon && !isDesktopMidSpan && perfilIcon}
              {showUserName && (
                <Typography 
                  component={Link} 
                  to={user ? `/${lang}/perfil` : `/${lang}/login`}
                  sx={{ 
                    color: 'black',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    transition: 'color 0.2s',
                    '&:hover': { color: pinkTheme.primary },
                    maxWidth: '60px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    ml: 0.8
                  }}
                >
                  {user ? user.nombre : 'Sign In'}
                </Typography>
              )}
              {showCart && !isDesktopMidSpan && (
                <IconButton
                  component={Link}
                  to={`/${lang}/carrito`}
                  sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
                  size="small"
                >
                  <Badge
                    badgeContent={cartCount}
                    color="error"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: pinkTheme.primary,
                        border: 'solid 1px white',
                        fontSize: '0.55rem',
                        height: '14px',
                        minWidth: '14px',
                        top: 3,
                        right: 3,
                      },
                    }}
                  >
                    <BsCart4 size={20} />
                  </Badge>
                </IconButton>
              )}
              {showFavorites && !isDesktopMidSpan && (
                <IconButton
                  onClick={() => setOpenModal(true)}
                  sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
                  size="small"
                >
                  <BsHeart size={18} />
                </IconButton>
              )}
              {showNotifications && !isDesktopMidSpan && (
                <IconButton
                  sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
                  onClick={(e) => handleOpenNotificationsMenu(e)}
                  size="small"
                >
                  <Badge
                    badgeContent={noLeidas}
                    color="error"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: pinkTheme.primary,
                        border: 'solid 1px white',
                        fontSize: '0.55rem',
                        height: '14px',
                        minWidth: '14px',
                        top: 3,
                        right: 3,
                      },
                    }}
                  >
                    <BsBell size={18} />
                  </Badge>
                </IconButton>
              )}
              {/* Desde 768px, si aún no se promueven notificaciones, mostrar el icono en lugar de la hamburguesa */}
              {isMdUp && !showNotifications && !isDesktopMidSpan && (
                <IconButton
                  sx={{ color: 'black', '&:hover': { color: pinkTheme.primary } }}
                  onClick={(e) => handleOpenNotificationsMenu(e)}
                  size="small"
                >
                  <Badge
                    badgeContent={noLeidas}
                    color="error"
                    overlap="circular"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: pinkTheme.primary,
                        border: 'solid 1px white',
                        fontSize: '0.55rem',
                        height: '14px',
                        minWidth: '14px',
                        top: 3,
                        right: 3,
                      },
                    }}
                  >
                    <BsBell size={18} />
                  </Badge>
                </IconButton>
              )}
              {/* Hamburguesa siempre en modo mid-span o cuando falta promover */}
              {isHamburgerVisible && (
                <IconButton
                  aria-label="menu"
                  ref={hamburgerBtnRef}
                  onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}
                  size="small"
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

          </Toolbar>

          {/* Barra de categorías */}
          <CategoryNav
            ref={navCategoriesRef}
            categories={categories}
            hoveredNavCategory={hoveredNavCategory}
            setHoveredNavCategory={setHoveredNavCategory}
            goToCategory={goToCategory}
            lang={lang}
            t={t}
            pinkTheme={pinkTheme}
          />
        </AppBar>

        {/* Menú móvil render */}
        {renderMobileMenu}

        {/* Menú de notificaciones global (siempre montado) */}
        <NotificationsMenu
          anchorEl={notificationsAnchorEl}
          open={isNotificationsMenuOpen}
          onClose={handleCloseNotificationsMenu}
          notificaciones={notificaciones}
          loading={notificacionesLoading}
          formatTime={formatNotificationTime}
          pinkTheme={pinkTheme}
          forceCenter={isHamburgerVisible}
        />

        {/* Menú de usuario */}
        <UserMenu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={() => setAnchorEl(null)}
          user={user}
          onLogout={() => handleLogout(lang, setAnchorEl)}
          navigate={navigate}
          lang={lang}
          t={t}
          pinkTheme={pinkTheme}
        />

        {/* Modal de favoritos (single modal now handled inside component) */}
        <FavoritesModal 
          open={openModal} 
          onClose={() => {
            setOpenModal(false);
            loadFavorites();
          }} 
        />
      </Box>

      <Box sx={{ height: '100px' }} />
    </>
  );
}