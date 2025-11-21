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
  const contentRef = useRef(null);
  const touchFlagRef = useRef(false); // evita doble disparo touch+click
  const [shouldCenter, setShouldCenter] = useState(true);
  const [isTouch, setIsTouch] = useState(false);

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

  // Detectar si es touch (responsiva)
  useEffect(() => {
    const updateIsTouch = () => {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
    };
    updateIsTouch();
    window.addEventListener('resize', updateIsTouch);
    return () => window.removeEventListener('resize', updateIsTouch);
  }, []);

  // Efecto para calcular si el contenido cabe en el contenedor
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setShouldCenter(contentWidth <= containerWidth);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, [categories]);

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
        <Box 
          ref={contentRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
            justifyContent: shouldCenter ? 'center' : 'flex-start',
            flexWrap: 'nowrap',
            width: 'fit-content',
            margin: shouldCenter ? '0 auto' : '0',
            transition: 'justify-content 0.3s ease, margin 0.3s ease',
          }}
        >
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
                onMouseEnter={!isTouch ? (() => { if (hasSubcategories) openCategory(category); }) : undefined}
                onMouseLeave={!isTouch ? (() => {
                  setTimeout(() => {
                    const dropdownHovered = document.querySelector('.nav-category-dropdown:hover');
                    if (!dropdownHovered && sameCategory(category)) {
                      closeCategory();
                    }
                  }, 120);
                }) : undefined}
                onTouchStart={isTouch ? (() => {
                  if (hasSubcategories) toggleCategory(category); else goToCategory(category);
                }) : undefined}
                onClick={isTouch ? undefined : (() => {
                  if (hasSubcategories) toggleCategory(category); else goToCategory(category);
                })}
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
            left: { xs: '50%', md: '50%' },
            transform: { xs: 'translateX(-50%)', md: 'translateX(-50%)' },
            borderRadius: '8px',
            zIndex: 1300,
            mt: 0,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            // Responsiva: ancho dinámico según número de subcategorías
            width: {
              xs: `min(calc(${hoveredNavCategory.sub_categories.length} * 150px + 32px), 100vw)`,
              sm: `min(calc(${hoveredNavCategory.sub_categories.length} * 170px + 40px), 100vw)`,
              md: hoveredNavCategory.sub_categories.length <= 2 ? '400px' : hoveredNavCategory.sub_categories.length <= 4 ? '600px' : '800px'
            },
            minWidth: {
              xs: hoveredNavCategory.sub_categories.length === 1 ? '170px' : 'unset',
              sm: hoveredNavCategory.sub_categories.length === 1 ? '200px' : 'unset',
              md: 'unset',
            },
            maxWidth: '100vw',
            animation: 'fadeScale 160ms ease-out',
            p: 0,
            left: { xs: '50%', md: '50%' },
            right: 'auto',
          }}
          onMouseEnter={!isTouch ? (() => openCategory(hoveredNavCategory)) : undefined}
          onMouseLeave={!isTouch ? (() => closeCategory()) : undefined}
        >
          <Box sx={{
            backgroundColor: '#fff',
            color: '#202020',
            borderRadius: '8px',
            py: { xs: 1.5, sm: 2, md: 3 },
            px: { xs: 1, sm: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            maxHeight: { xs: '60vh', md: '70vh' },
            overflow: 'hidden',
          }}>
            <Typography variant="h6" sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '16px', sm: '18px', md: '20px' },
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

            {/* Carrusel horizontal en móviles/tabletas, grid en desktop */}
            <Box
              sx={theme => ({
                display: { xs: 'block', sm: 'block', md: 'grid' },
                gridTemplateColumns: hoveredNavCategory.sub_categories.length <= 2 ? 'repeat(2, 1fr)' :
                  hoveredNavCategory.sub_categories.length <= 4 ? 'repeat(2, 1fr)' :
                  'repeat(3, 1fr)',
                gap: { xs: 1.5, sm: 2, md: 2 },
                overflowX: { xs: 'auto', sm: 'auto', md: 'visible' },
                overflowY: { xs: 'hidden', sm: 'hidden', md: 'auto' },
                maxWidth: '100vw',
                maxHeight: { xs: '180px', sm: '200px', md: '50vh' },
                whiteSpace: { xs: 'nowrap', sm: 'nowrap', md: 'normal' },
                pb: { xs: 1, sm: 1, md: 0 },
                px: { xs: 0.5, sm: 1, md: 0 },
                WebkitOverflowScrolling: 'touch',
              })}
            >
              {hoveredNavCategory.sub_categories.map((sub) => (
                <Box
                  key={sub.id || sub.slug}
                  onClick={() => goToCategory(sub, hoveredNavCategory)}
                  sx={theme => ({
                    cursor: 'pointer',
                    minWidth: { xs: '120px', sm: '140px', md: '180px' },
                    maxWidth: { xs: '140px', sm: '180px', md: '250px' },
                    width: { xs: '120px', sm: '140px', md: '100%' },
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    margin: { xs: '0 8px 0 0', sm: '0 12px 0 0', md: '0 auto' },
                    border: '1px solid #f0f0f0',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    },
                    whiteSpace: 'normal',
                  })}
                >
                  <Box sx={{ width: '100%', height: { xs: '70px', sm: '120px', md: '220px' }, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={sub.imagen_url || noImage}
                      alt={sub.nombre_categoria || sub.nombre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        display: 'block',
                      }}
                    />
                  </Box>
                  <Typography sx={{
                    mt: 1,
                    fontSize: { xs: '12px', sm: '13px', md: '14px' },
                    fontWeight: 500,
                    color: '#202020',
                    textTransform: 'capitalize',
                    padding: '0 6px 8px',
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