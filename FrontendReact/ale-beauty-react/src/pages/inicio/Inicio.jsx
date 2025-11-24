import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import bannerNovedades from '../../assets/images/bannerNovedades.jpg';
import RotatingBanner from './RotatingBanner';
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
import useRecordPageView from './hooks/useRecordPageView.js';
import { useTranslation } from 'react-i18next';

import HomeCarousel from '../../components/InicioCarousel.jsx';
import ProductsStrip from '../../components/ProductsStrip.jsx';

function Inicio() {
  useRecordPageView();

  const { lang } = useParams();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { addAlert } = useAlert();
  const { t } = useTranslation();

  const token = localStorage.getItem('token');

  const {
    products,
    newProducts,
    homeLoading,
    homeError,
    carousel,
    carouselLoading,
    carouselError,
    reloadCarousel
  } = useHomeData(token, addAlert);

  const { productRatings, loadRatings } = useProductRatings(token);
  const { addToCart } = useCartActions(token, null, addAlert, t);

  const { toggleFavorite, effectiveFavorites } = useFavoriteActions(
    token,
    loadFavorites,
    addAlert,
    favoriteIds || [],
    t
  );

  const memoizedProducts = useMemo(() => products.slice(0, 9), [products]);
  const memoizedNewProducts = useMemo(() => newProducts, [newProducts]);

  useEffect(() => {
    if (!homeLoading && products.length > 0) {
      const timer = setTimeout(() => loadRatings(products), 800);
      return () => clearTimeout(timer);
    }
  }, [homeLoading, products, loadRatings]);

  useEffect(() => {
    if (!homeLoading && newProducts.length > 0) {
      const timer = setTimeout(() => loadRatings(newProducts.slice(0, 6)), 400);
      return () => clearTimeout(timer);
    }
  }, [homeLoading, newProducts, loadRatings]);

  const isFavorite = useCallback(
    (productId) => Array.isArray(effectiveFavorites) && effectiveFavorites.includes(productId),
    [effectiveFavorites]
  );

  return (
    <div>
      <HomeCarousel
        homeLoading={homeLoading}
        carouselLoading={carouselLoading}
        carouselError={carouselError}
        carouselItems={carousel}
        onRetry={() => reloadCarousel(true)}
        t={t}
      />

      <ProductsStrip
        title={t('home.newMakeup')}
        loading={homeLoading}
        products={newProducts}
        memoizedProducts={memoizedNewProducts}
        lang={lang}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onAddToCart={addToCart}
        productRatings={productRatings}
        t={t}
        skeletonCount={6}
      />

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
            <div className="banner-item" key={index}>{text}</div>
          ))}
        </div>
      </div>

      <ProductsStrip
        title={t('home.mayInterestYou')}
        loading={homeLoading}
        products={products}
        memoizedProducts={memoizedProducts}
        lang={lang}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onAddToCart={addToCart}
        productRatings={productRatings}
        t={t}
        skeletonCount={6}
        autoScroll
      />

      <FloatingChat />
      <RotatingBanner />

      <h2 className="mb-4">{t('home.topRatedProducts') || 'Productos mejor valorados'}</h2>
      <RankingPro
        products={products}
        productRatings={productRatings}
        loading={homeLoading}
      />
    </div>
  );
}

export default Inicio;