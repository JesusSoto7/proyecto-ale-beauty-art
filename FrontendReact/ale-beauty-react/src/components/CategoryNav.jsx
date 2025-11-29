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
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const sameCategory = useCallback((cat) => {
    if (!cat || !hoveredNavCategory) return false;
    return (hoveredNavCategory.id && hoveredNavCategory.id === cat.id) ||
      (hoveredNavCategory.slug && hoveredNavCategory.slug === cat.slug);
  }, [hoveredNavCategory]);
  const MAX_RETRIES = 3;

  const openCategory = useCallback(async (cat) => {
    if (!cat) return;
    let retries = 0;
    let success = false;
    setLoadingSubCategories(true);

    while (retries < MAX_RETRIES && !success) {
      try {
        setHoveredNavCategory(cat);
        success = true; // Si se logra abrir correctamente, marca como éxito
      } catch (error) {
        retries += 1; // Incrementar reintento
      }
    }

    if (!success) {
      console.error('Error al cargar las subcategorías después de varios intentos.');
    }

    setLoadingSubCategories(false);
  }, [setHoveredNavCategory]);

  const closeCategory = useCallback(() => {
    setHoveredNavCategory(null);
  }, [setHoveredNavCategory]);

  const toggleCategory = useCallback((cat) => {
    if (!cat || touchFlagRef.current) return; // Evitar doble disparo por touchFlag
    touchFlagRef.current = true;

    if (sameCategory(cat)) closeCategory(); else openCategory(cat);

    // Reiniciar el flag después de un pequeño retraso
    setTimeout(() => {
      touchFlagRef.current = false;
    }, 200); // Ajusta el tiempo según el flujo esperado
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
      {/* Dropdown de subcategorías */}
      {hoveredNavCategory && hoveredNavCategory.sub_categories && (
        <Box
          className="nav-category-dropdown"
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            borderRadius: '20px',
            zIndex: 1300,
            mt: 0,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            maxWidth: '1200px',
            animation: loadingSubCategories ? 'fadeIn 300ms ease-out' : 'fadeScale 160ms ease-out',
            opacity: loadingSubCategories ? 0.75 : 1,
            pointerEvents: loadingSubCategories ? 'none' : 'auto',
            p: 0,
          }}
          onMouseEnter={!isTouch ? (() => openCategory(hoveredNavCategory)) : undefined}
          onMouseLeave={!isTouch ? (() => closeCategory()) : undefined}
        >
          <Box
            sx={{
              backgroundColor: '#fff',
              color: '#202020',
              borderRadius: '20px',
              py: { xs: 1.5, sm: 2, md: 3 },
              px: { xs: 1, sm: 2, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              maxHeight: { xs: '60vh', md: '70vh' },
              overflow: 'hidden',
            }}
          >
            {loadingSubCategories ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <Skeleton variant="rectangular" width="100%" height="60px" />
                <Typography sx={{ mt: 1, textAlign: 'center', fontSize: '14px' }}>
                  Cargando subcategorías...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Contenedor principal en estilo GRID del diseño */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '0.8fr 1.2fr',
                    gap: 4,
                    alignItems: 'center',
                    padding: '24px',
                  }}
                >
                  {/* Imagen grande izquierda */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '400px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <img
                      src={hoveredNavCategory?.imagen_url}
                      alt={hoveredNavCategory?.nombre_categoria || hoveredNavCategory?.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>

                  {/* Bloque derecho: título de la categoría principal y grid con scroll */}
                  <Box sx={{ width: '100%' }}>

                    {/* Título y separador */}
                    <Box
                      sx={{
                        textAlign: 'left',
                        mb: 3
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          mb: 0.5,
                          fontWeight: 500,
                          fontSize: { xs: '20px', sm: '24px', md: '28px' },
                          color: '#202020',
                        }}
                      >
                        {hoveredNavCategory.nombre_categoria || hoveredNavCategory.name}
                      </Typography>
                      {/* Línea Separadora Rosa/Roja */}
                      <Box
                        sx={{
                          width: '60px',
                          height: '4px',
                          backgroundColor: '#ff007f',
                          borderRadius: '2px',
                        }}
                      />
                    </Box>

                    {/* GRID tipo tarjetas*/}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 2,
                        paddingTop: 1,

                        maxHeight: "400px",
                        overflowY: "auto",

                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#ff007f',
                          borderRadius: '10px',
                        },
                      }}
                    >
                      {hoveredNavCategory.sub_categories.map((sub) => (
                        <Box
                          key={sub.id || sub.slug}
                          onClick={() => goToCategory(sub, hoveredNavCategory)}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            background: '#fff0f5',
                            borderRadius: '16px',
                            padding: '8px',
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                            },
                          }}
                        >
                          {/* Imagen dentro de la card */}
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#ffffff',
                            }}
                          >
                            <img
                              src={sub.imagen_url || noImage}
                              alt={sub.nombre_categoria || sub.nombre}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </>
            )}
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