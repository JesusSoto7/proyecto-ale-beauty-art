import React, { forwardRef, useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Skeleton } from '@mui/material';
import { MdKeyboardArrowRight } from 'react-icons/md';
import noImage from '../assets/images/no_image.png';

const CategoryNav = forwardRef(({ 
  categories, 
  hoveredNavCategory, 
  setHoveredNavCategory, 
  goToCategory, 
  lang, 
  t, 
  pinkTheme 
}, ref) => {
  const containerRef = useRef(null);
  const touchFlagRef = useRef(false); // evita doble disparo touch+click
  const sameCategory = useCallback((cat) => {
    if (!cat || !hoveredNavCategory) return false;
    return (hoveredNavCategory.id && hoveredNavCategory.id === cat.id) ||
           (hoveredNavCategory.slug && hoveredNavCategory.slug === cat.slug);
  }, [hoveredNavCategory]);

  const openCategory = useCallback((cat) => {
    if (!cat) return;
    setHoveredNavCategory(cat);
  }, [setHoveredNavCategory]);

  const closeCategory = useCallback(() => {
    setHoveredNavCategory(null);
  }, [setHoveredNavCategory]);

  const toggleCategory = useCallback((cat) => {
    if (!cat) return;
    if (sameCategory(cat)) closeCategory(); else openCategory(cat);
  }, [sameCategory, closeCategory, openCategory]);

  // Cierre al click / tap fuera del dropdown y del contenedor
  useEffect(() => {
    function handleOutside(e) {
      if (!hoveredNavCategory) return;
      const dropdown = document.querySelector('.nav-category-dropdown');
      if (dropdown && dropdown.contains(e.target)) return;
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      closeCategory();
    }
    document.addEventListener('pointerdown', handleOutside, { passive: true });
    document.addEventListener('click', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('click', handleOutside);
    };
  }, [hoveredNavCategory, closeCategory]);

  return (
    <Box 
      ref={(node) => { containerRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
      sx={{ 
        backgroundColor: '#df6897ff',
        color: 'white',
        py: 0.5, // Reduce el padding vertical
        position: 'relative',
      }}
    >
      <Box 
        sx={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          WebkitOverflowScrolling: 'touch',
          padding: '0 16px',
          minHeight: '24px', // Reduce la altura mínima
          margin: '0 auto',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
          justifyContent: 'center',
          flexWrap: 'nowrap',
          width: 'fit-content',
        }}>
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
              flexShrink: 0,
              '&:hover': { color: pinkTheme.secondary }
            }}
          >
            {t('header.products')} |
          </Typography>

          {categories.map((category) => {
            const categoryName = category?.nombre_categoria || category?.name || 'Categoría';
            const hasSubcategories = category.sub_categories && category.sub_categories.length > 0;
            return (
              <Box
                key={category.id || category.slug}
                sx={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                onMouseEnter={() => { if (hasSubcategories) openCategory(category); }}
                onMouseLeave={() => {
                  // Si el puntero sale del nombre y no entra al dropdown, cerrar
                  setTimeout(() => {
                    const dropdownHovered = document.querySelector('.nav-category-dropdown:hover');
                    // Cerramos sólo si seguimos en la misma categoría y no estamos sobre el dropdown
                    if (!dropdownHovered && sameCategory(category)) {
                      closeCategory();
                    }
                  }, 120);
                }}
                onTouchStart={() => {
                  touchFlagRef.current = true;
                  if (hasSubcategories) toggleCategory(category); else goToCategory(category);
                }}
                onClick={() => {
                  if (touchFlagRef.current) { touchFlagRef.current = false; return; }
                  if (hasSubcategories) toggleCategory(category); else goToCategory(category);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (hasSubcategories) toggleCategory(category); else goToCategory(category);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-haspopup={hasSubcategories ? 'true' : 'false'}
                aria-expanded={hasSubcategories ? sameCategory(category) : undefined}
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
                  {hasSubcategories && <MdKeyboardArrowRight size={16} />}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Dropdown de subcategorías */}
      {hoveredNavCategory && hoveredNavCategory.sub_categories && hoveredNavCategory.sub_categories.length > 0 && (
        <Box
          className="nav-category-dropdown"
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '8px',
            zIndex: 1300,
            mt: 1,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            minWidth: hoveredNavCategory.sub_categories.length <= 2 ? '400px' : 
                     hoveredNavCategory.sub_categories.length <= 4 ? '600px' : '800px',
            maxWidth: '90vw',
            width: 'auto',
            animation: 'fadeScale 160ms ease-out',
          }}
          onMouseEnter={() => openCategory(hoveredNavCategory)}
          onMouseLeave={() => closeCategory()}
        >
          <Box sx={{
            backgroundColor: '#fff',
            color: '#202020',
            borderRadius: '8px',
            py: 3,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '70vh',
            overflow: 'hidden',
          }}>
            <Typography variant="h6" sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '18px', md: '20px' },
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#202020',
              textAlign: 'center',
            }}>
              {hoveredNavCategory.nombre_categoria || hoveredNavCategory.name}
            </Typography>
            
            <Box sx={{
              width: '50px',
              height: '3px',
              backgroundColor: '#e60073',
              mb: 3,
              borderRadius: '2px',
              mx: 'auto',
            }} />

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: hoveredNavCategory.sub_categories.length <= 2 ? 'repeat(2, 1fr)' :
                                   hoveredNavCategory.sub_categories.length <= 4 ? 'repeat(2, 1fr)' :
                                   { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
              overflowY: 'auto',
              maxHeight: '50vh',
            }}>
              {hoveredNavCategory.sub_categories.map((sub) => (
                <Box
                  key={sub.id || sub.slug}
                  onClick={() => goToCategory(sub, hoveredNavCategory)}
                  sx={{
                    cursor: 'pointer',
                    maxWidth: '250px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    margin: '0 auto',
                    border: '1px solid #f0f0f0',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ width: '100%', height: '150px', overflow: 'hidden' }}>
                    <img
                      src={sub.imagen_url || noImage}
                      alt={sub.nombre_categoria || sub.nombre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography sx={{
                    mt: 1.5,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#202020',
                    textTransform: 'capitalize',
                    padding: '0 10px 10px',
                  }}>
                    {sub.nombre_categoria || sub.nombre}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
});

CategoryNav.displayName = 'CategoryNav';

// Añade animación si no existe aún (evita duplicados)
if (typeof document !== 'undefined' && !document.getElementById('nav-dropdown-anim')) {
  const style = document.createElement('style');
  style.id = 'nav-dropdown-anim';
  style.innerHTML = `@keyframes fadeScale {0% {opacity:0; transform:translateX(-50%) scale(.95);}100% {opacity:1; transform:translateX(-50%) scale(1);}}`;
  document.head.appendChild(style);
}

export default CategoryNav;