import React, { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart, BsCart4, BsBell } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";

import AppBar from '@mui/material/AppBar';
import { Box, Badge, Select, MenuItem, FormControl } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';

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
  
  // Estados locales
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  
  // Refs
  const navCategoriesRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
                  display: { xs: 'none', sm: 'block' },
                  textDecoration: 'none',
                  color: '#df6eacff',
                  fontWeight: 'bold',
                  fontSize: '1.9rem',
                  letterSpacing: '0.5px',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: pinkTheme.primary
                  }
                }}
              >
                Ale Beauty Art
              </Typography>
            </Box>

            {/* Barra de búsqueda */}
            <Box sx={{ 
              flex: 1, 
              maxWidth: '600px', 
              mx: 3, 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <SearchBar />
            </Box>

            {/* Íconos */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Selector de idioma */}
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

              {/* Perfil */}
              {perfilIcon}

              {/* Nombre */}
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
                  minWidth: '80px'
                }}
              >
                {user ? user.nombre : 'Sign In'}
              </Typography>

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
              <IconButton
                onClick={() => setOpenModal(true)}
                sx={{ color: "black", "&:hover": { color: pinkTheme.primary } }}
              >
                <BsHeart size={22} />
              </IconButton>

              {/* Notificaciones */}
              <IconButton
                sx={{ color: "black", "&:hover": { color: pinkTheme.primary }}}
                onClick={handleOpenNotificationsMenu}
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
              
              {/* Menú de notificaciones */}
              <NotificationsMenu
                anchorEl={notificationsAnchorEl}
                open={isNotificationsMenuOpen}
                onClose={handleCloseNotificationsMenu}
                notificaciones={notificaciones}
                loading={notificacionesLoading}
                formatTime={formatNotificationTime}
                pinkTheme={pinkTheme}
              />
            </Box>

            {/* Menú móvil */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={(e) => setMobileMoreAnchorEl(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
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

        {/* Modal de favoritos */}
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

      <Box sx={{ height: '100px' }} />
    </>
  );
}