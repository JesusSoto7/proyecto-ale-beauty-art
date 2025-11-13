import React, { useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import bannerNovedades from '../../assets/images/bannerNovedades.jpg'
import { useOutletContext } from "react-router-dom";
import RotatingBanner from "./RotatingBanner";
import { useTranslation } from 'react-i18next';
import FloatingChat from '../../components/FloatingChat';
import BannerProduct from '../../components/bannerProducts';
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

function Inicio() {
  const { lang } = useParams();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { addAlert } = useAlert();
  const { t } = useTranslation();
  
  const token = localStorage.getItem('token');
  const interesRef = useRef(null);

  // ✅ Custom hooks separados
  const { 
    products, 
    newProducts, 
    cart, 
    setCart, 
    loading 
  } = useHomeData(token, addAlert);

  const { 
    productRatings, 
    loadRatings 
  } = useProductRatings(token);

  const { addToCart } = useCartActions(token, setCart, addAlert, t);
  
  // ✅ Hook de favoritos con validación
  const { toggleFavorite, effectiveFavorites } = useFavoriteActions(
    token, 
    loadFavorites, 
    addAlert, 
    favoriteIds || [], // ✅ Fallback a array vacío
    t
  );

  // ✅ Memoizar productos para evitar re-renders
  const memoizedProducts = useMemo(() => products.slice(0, 9), [products]);
  const memoizedNewProducts = useMemo(() => newProducts, [newProducts]);

  // ✅ Auto-scroll para el carrusel
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

  // ✅ Cargar ratings de TODOS los productos (para el ranking)
  useEffect(() => {
    if (!loading && products.length > 0) {
      const timer = setTimeout(() => {
        loadRatings(products);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, products, loadRatings]);

  // ✅ Cargar ratings de novedades
  useEffect(() => {
    if (!loading && newProducts.length > 0) {
      const timer = setTimeout(() => {
        loadRatings(newProducts.slice(0, 6));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, newProducts, loadRatings]);

  // ✅ Helper seguro para verificar favoritos
  const isFavorite = (productId) => {
    return Array.isArray(effectiveFavorites) && effectiveFavorites.includes(productId);
  };

  return (
    <div>
      {/* Sección Novedades Maquillaje */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.newMakeup')}</h2>
        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4].map((skeleton) => (
                <div className="product-card" key={skeleton}>
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

      {/* Banner - SIN MARGEN */}
      <div style={{ margin: 0, padding: 0, width: "100%" }}>
        <img
          src={bannerNovedades} 
          alt={t('home.newsBannerAlt')}
          loading="lazy"
          decoding="async"
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

      {/* Banner delgado en movimiento - PEGADO AL BANNER */}
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

      {/* Sección Quizás te puedan interesar */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.mayInterestYou')}</h2>

        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                <div className="product-card" key={skeleton}>
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
      <BannerProduct products={products} productRatings={productRatings}/>
      <RotatingBanner />
      
      <h2 className="mb-4">Productos mejor valorados</h2>
      <RankingPro products={products} productRatings={productRatings} loading={loading} />
    </div>
  );
}

export default Inicio;