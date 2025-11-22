import React, { useRef, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import ProductCard from './ProductCard.jsx';

export default function ProductsStrip({
  title,
  loading,
  products,
  memoizedProducts,
  lang,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  productRatings,
  t,
  skeletonCount = 6,
  autoScroll = false,
  autoScrollStep = 305,
  autoScrollInterval = 2700
}) {
  const stripRef = useRef(null);

  useEffect(() => {
    if (!autoScroll || loading) return;
    const interval = setInterval(() => {
      if (stripRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = stripRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          stripRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          stripRef.current.scrollBy({ left: autoScrollStep, behavior: 'smooth' });
        }
      }
    }, autoScrollInterval);
    return () => clearInterval(interval);
  }, [autoScroll, loading, autoScrollInterval, autoScrollStep]);

  return (
    <section className="mt-5">
      <h2 className="mb-4">{title}</h2>
      {loading ? (
        <div className="carousel-container">
          <div className="carousel-items">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div className="product-card" key={i}>
                <div className="image-container">
                  <Skeleton variant="rectangular" width="100%" height={200} />
                </div>
                <Skeleton variant="text" width={150} height={30} />
                <Skeleton variant="text" width={80} height={20} />
                <div className="actions">
                  <Skeleton variant="rectangular" width={120} height={36} />
                  <Skeleton variant="circular" width={36} height={36} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : memoizedProducts.length > 0 ? (
        <div className="carousel-container">
          <button
            type="button"
            className="carousel-btn prev"
            onClick={() => {
              stripRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
            aria-label="Anterior"
          >
            ❮
          </button>

            <div className="carousel-items" ref={stripRef}>
            {memoizedProducts.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                lang={lang}
                isFavorite={isFavorite(prod.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={(item) => onAddToCart(item, memoizedProducts)}
                productRating={productRatings[prod.id]}
                t={t}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-btn next"
            onClick={() => {
              stripRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
            aria-label="Siguiente"
          >
            ❯
          </button>
        </div>
      ) : (
        <p>{t('home.noProducts')}</p>
      )}
    </section>
  );
}