import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Carousel from 'react-bootstrap/Carousel';

export default function InicioCarousel({
  homeLoading,
  carouselLoading,
  carouselError,
  carouselItems,
  onRetry,
  t
}) {
  if (homeLoading) {
    return (
      <Skeleton
        sx={{ bgcolor: 'grey.800' }}
        variant="rectangular"
        width="100%"
        height={350}
      />
    );
  }

  if (carouselLoading) {
    return <Skeleton variant="rectangular" width="100%" height={350} />;
  }

  if (carouselError) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#b91c1c' }}>
        {t('home.carouselError') || 'Error cargando carrusel'}: {carouselError.message}
        <button
          style={{
            marginLeft: 12,
            background: '#7e6bfb',
            color: '#fff',
            border: 'none',
            padding: '6px 14px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
          onClick={onRetry}
        >
          {t('home.retry') || 'Reintentar'}
        </button>
      </div>
    );
  }

  if (!carouselItems || carouselItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
        {t('home.noCarouselImages') || 'No hay imágenes en el carrusel.'}
      </div>
    );
  }

  return (
    <Carousel interval={3000} className="main-carousel mb-0">
      {carouselItems.map(item => (
        <Carousel.Item key={item.id}>
          <img
            className="d-block w-100"
            src={item.url}
            alt={`${t('home.slide')} ${item.id}`}
            style={{ height: '450px', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/1280x450?text=Imagen+no+disponible';
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}