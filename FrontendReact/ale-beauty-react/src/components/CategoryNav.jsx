import React, { forwardRef } from 'react';
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
  return (
    <Box 
      ref={ref}
      sx={{ 
        backgroundColor: '#df6897ff',
        color: 'white',
        py: 1,
        position: 'relative',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          WebkitOverflowScrolling: 'touch',
          padding: '0 16px',
          minHeight: '30px',
          margin: '0 auto',
          width: 'fit-content',
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
          }}
          onMouseEnter={() => setHoveredNavCategory(hoveredNavCategory)}
          onMouseLeave={() => setHoveredNavCategory(null)}
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

export default CategoryNav;