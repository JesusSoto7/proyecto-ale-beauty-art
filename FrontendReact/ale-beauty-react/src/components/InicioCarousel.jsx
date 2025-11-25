import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Carousel from 'react-bootstrap/Carousel';

export default function InicioCarousel({
  homeLoading,
  carouselLoading,
  carouselError,
  carouselItems,
  onRetry,
  t,
}) {
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);

  const totalImages = carouselItems?.length || 0;

  useEffect(() => {
    if (!carouselLoading && carouselItems?.length > 0) {
      const imagePromises = carouselItems.map((item) => {
        const img = new Image();
        img.src = item.url; // Asegúrate de que 'url' sea la propiedad correcta para la fuente de la imagen.
        return new Promise((resolve) => {
          img.onload = () => {
            setImagesLoadedCount((prev) => prev + 1); // Incrementa el contador de imágenes cargadas.
            resolve(true);
          };
          img.onerror = () => resolve(false);
        });
      });

      Promise.all(imagePromises).catch((error) => console.error(error));
    }
  }, [carouselLoading, carouselItems]);

  if (homeLoading || carouselLoading || imagesLoadedCount < totalImages) {
    return (
      <Skeleton
        sx={{ bgcolor: 'grey.800' }}
        variant="rectangular"
        width="100%"
        height={450} // Ajustado al mismo tamaño que las imágenes del carrusel.
        animation="wave"
      />
    );
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
            cursor: 'pointer',
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
      {carouselItems.map((item) => (
        <Carousel.Item key={item.id}>
          <img
            className="d-block w-100"
            src={item.url}
            alt={`${t('home.slide')} ${item.id}`}
            style={{ height: '450px', objectFit: 'cover' }}
            loading="lazy" // Carga diferida para mejorar la respuesta.
            decoding="async" // Optimiza el tiempo de carga.
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/1280x450?text=Imagen+no+disponible';
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}