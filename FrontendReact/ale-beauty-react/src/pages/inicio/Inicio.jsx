import React, { useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import bannerNovedades from '../../assets/images/bannerNovedades.jpg';
import { useOutletContext } from "react-router-dom";
import RotatingBanner from "./RotatingBanner";
import { useTranslation } from 'react-i18next';
import FloatingChat from '../../components/FloatingChat';
import "../../assets/stylesheets/RankingPro.css";
import '../../assets/stylesheets/ProductCard.css';
import '../../assets/stylesheets/Inicio.css';
import RankingPro from '../../components/rankingPro.jsx';
import { useAlert } from "../../components/AlertProvider.jsx";
import { useHomeData } from './hooks/useHomeData';
import { useProductRatings } from './hooks/useProductsRating.js';
import { useCartActions } from './hooks/useCartActions';
import { useFavoriteActions } from './hooks/useFavoriteActions';
import ProductCard from '../../components/ProductCard.jsx';
import Carousel from 'react-bootstrap/Carousel';

function Inicio() {
  const { lang } = useParams();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { addAlert } = useAlert();
  const { t } = useTranslation();

  const token = localStorage.getItem('token');
  const interesRef = useRef(null);

  const {
    products,
    newProducts,
    cart,
    setCart,
    loading,
    carousel,
    carouselLoading,
    carouselError,
    reloadCarousel
  } = useHomeData(token, addAlert);

  const {
    productRatings,
    loadRatings
  } = useProductRatings(token);

  const { addToCart } = useCartActions(token, setCart, addAlert, t);

  const { toggleFavorite, effectiveFavorites } = useFavoriteActions(
    token,
    loadFavorites,
    addAlert,
    favoriteIds || [],
    t
  );

  const memoizedProducts = useMemo(() => products.slice(0, 9), [products]);
  const memoizedNewProducts = useMemo(() => newProducts, [newProducts]);

  // Auto-scroll “Quizás te puedan interesar”
  useEffect(() => {
    const interval = setInterval(() => {
      if (interesRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = interesRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          interesRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          interesRef.current.scrollBy({ left: 305, behavior: "smooth" });
        }
      }
    }, 2700);
    return () => clearInterval(interval);
  }, []);

  // Ratings globales
  useEffect(() => {
    if (!loading && products.length > 0) {
      const timer = setTimeout(() => loadRatings(products), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, products, loadRatings]);

  // Ratings novedades
  useEffect(() => {
    if (!loading && newProducts.length > 0) {
      const timer = setTimeout(() => loadRatings(newProducts.slice(0, 6)), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, newProducts, loadRatings]);

  const isFavorite = (productId) =>
    Array.isArray(effectiveFavorites) && effectiveFavorites.includes(productId);

  // Para depurar manualmente en consola
  useEffect(() => {
    window.reloadCarousel = reloadCarousel;
    return () => { delete window.reloadCarousel; };
  }, [reloadCarousel]);

  return (
    <div>
      {/* Carrusel principal */}
      {loading ? (
        <Skeleton sx={{ bgcolor: 'grey.800' }} variant="rectangular" width="100%" height={350} />
      ) : carouselLoading ? (
        <Skeleton variant="rectangular" width="100%" height={350} />
      ) : carouselError ? (
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
            onClick={reloadCarousel}
          >
            {t('home.retry') || 'Reintentar'}
          </button>
        </div>
      ) : carousel.length > 0 ? (
        <Carousel interval={3000} className="main-carousel mb-0">
          {carousel.map(item => (
            <Carousel.Item key={item.id}>
              <img
                className="d-block w-100"
                src={item.url}
                alt={`${t('home.slide')} ${item.id}`}
                style={{ height: "450px", objectFit: "cover" }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1280x450?text=Imagen+no+disponible';
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
          {t('home.noCarouselImages') || 'No hay imágenes en el carrusel.'}
        </div>
      )}

      {/* Novedades */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.newMakeup')}</h2>
        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4].map((s) => (
                <div className="product-card" key={s}>
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
        ) : memoizedNewProducts.length > 0 ? (
          <div className="carousel-container">
            <button
              className="carousel-btn prev"
              onClick={() => {
                document.querySelector(".carousel-items")
                  ?.scrollBy({ left: -300, behavior: "smooth" });
              }}
              aria-label="Anterior"
            >
              ❮
            </button>

            <div className="carousel-items">
              {memoizedNewProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  lang={lang}
                  isFavorite={isFavorite(prod.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={(item) => addToCart(item, memoizedNewProducts)}
                  productRating={productRatings[prod.id]}
                  t={t}
                />
              ))}
            </div>

            <button
              className="carousel-btn next"
              onClick={() => {
                document.querySelector(".carousel-items")
                  ?.scrollBy({ left: 300, behavior: "smooth" });
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

      {/* Banner grande */}
      <div style={{ margin: 0, padding: 0, width: "100%" }}>
        <img
          src={bannerNovedades}
          alt={t('home.newsBannerAlt')}
          loading="lazy"
          decoding="async"
          className="banner-novedades-img"
          style={{
            width: "100%",
            height: "350px",
            objectFit: "cover",
            display: "block",
            margin: 0,
            padding: 0
          }}
        />
      </div>

      {/* Banner ticker */}
      <div className="banner-ticker" style={{ marginTop: 0 }}>
        <div className="banner-track">
          {[
            t('home.bannerText1'),
            t('home.bannerText2'),
            t('home.bannerText3'),
            t('home.bannerText4'),
            t('home.bannerText5'),
            t('home.bannerText6'),
            t('home.bannerText7'),
            t('home.bannerText8')
          ].concat([
            t('home.bannerText1'),
            t('home.bannerText2'),
            t('home.bannerText3'),
            t('home.bannerText4'),
            t('home.bannerText5'),
            t('home.bannerText6'),
            t('home.bannerText7'),
            t('home.bannerText8')
          ]).map((text, index) => (
            <div className="banner-item" key={index}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Quizás te puedan interesar */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.mayInterestYou')}</h2>
        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div className="product-card" key={s}>
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
            <div className="carousel-items" ref={interesRef}>
              {memoizedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  lang={lang}
                  isFavorite={isFavorite(prod.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={(item) => addToCart(item, memoizedProducts)}
                  productRating={productRatings[prod.id]}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>{t('home.noProducts')}</p>
        )}
      </section>

      <FloatingChat />
      <RotatingBanner />

      <h2 className="mb-4">Productos mejor valorados</h2>
      <RankingPro products={products} productRatings={productRatings} loading={loading} />
    </div>
  );
}

export default Inicio;