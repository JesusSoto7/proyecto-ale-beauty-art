import React, { useEffect, useState, useRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import { Link, useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { formatCOP } from '../../services/currency';
import bannerNovedades from '../../assets/images/bannerNovedades.jpg'
import { useOutletContext } from "react-router-dom";
import noImage from "../../assets/images/no_image.png";
import RotatingBanner from "./RotatingBanner";
import { useTranslation } from 'react-i18next';

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  
  const token = localStorage.getItem('token');
  const interesRef = useRef(null);

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

  // Cargar productos + favoritos del usuario
  useEffect(() => {
    fetch('https://localhost:4000/api/v1/inicio')
      .then(res => res.json())
      .then(data => {
        const imgs = [
          ...(data.admin_carousel || []),
          ...(data.products?.map(p => p.imagen_url) || [])
        ];

        let loadedCount = 0;
        if (imgs.length === 0) {
          setCarousel(data.admin_carousel || []);
          setProducts(data.products || []);
          setCategories(data.categories || []);
          setLoading(false);
          return;
        }

        const productosRandom = [...(data.products || [])].sort(() => 0.5 - Math.random());
        setProducts(productosRandom);

        imgs.forEach(src => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === imgs.length) {
              setCarousel(data.admin_carousel || []);
              setProducts(data.products || []);
              const productosRandom = [...(data.products || [])].sort(() => 0.5 - Math.random());
              setProducts(productosRandom);
              setCategories(data.categories || []);
              setLoading(false);
            }
          };
        });
      })
      .catch(err => {
        console.error(t('home.loadError'), err);
        setLoading(false);
      });

    // Carrito
    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error(t('home.cartError'), err));

    // Favoritos
    fetch('https://localhost:4000/api/v1/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map(fav => fav.id);
        setFavoriteIds(ids);
      })
      .catch(err => console.error(t('home.favoritesError'), err));
  }, [token, t]);

  const addToCart = (productId) => {
    fetch('https://localhost:4000/api/v1/cart/add_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) {
          setCart(data.cart);
          alert(t('home.addedToCart'));
        } else if (data.errors) {
          alert(t('home.error') + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error(t('home.cartAddError'), err);
        alert(t('home.cartAddError'));
      });
  };

  // Toggle favoritos
  const toggleFavorite = async (productId) => {
    if (favoriteIds.includes(productId)) {
      try {
        const res = await fetch(`https://localhost:4000/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await loadFavorites();
        }
      } catch (err) {
        console.error(t('home.removeFavoriteError'), err);
      }
    } else {
      try {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites();
        }
      } catch (err) {
        console.error(t('home.addFavoriteError'), err);
      }
    }
  };

  return (
    <div>
      {loading ? (
        <Skeleton sx={{ bgcolor: 'grey.800' }} variant="rectangular" width={"100%"} height={350} />
      ) : carousel.length > 0 ? (
        <Carousel interval={3000} className="mb-0">
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`${t('home.slide')} ${idx + 1}`}
                style={{ height: "400px", objectFit: "cover" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : null}

      {/* Sección Novedades */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.newMakeup')}</h2>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress />
          </div>
        ) : products.length > 0 ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {products.map((prod) => (
                <div className="product-card" key={prod.id} style={{ position: "relative" }}>
                  <IconButton
                    onClick={() => toggleFavorite(prod.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    {favoriteIds.includes(prod.id) ? (
                      <Favorite sx={{ color: "white" }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>

                  <Link
                    to={`/${lang}/producto/${prod.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="image-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                      {prod.imagen_url ? (
                        <img
                          src={prod.imagen_url}
                          alt={prod.nombre_producto}
                          onError={(e) => { e.currentTarget.src = noImage; }}
                        />
                      ) : (
                        <CircularProgress />
                      )}
                    </div>
                    <h5>{prod.nombre_producto}</h5>
                    <p>{formatCOP(prod.precio_producto)}</p>
                  </Link>

                  <div className="actions">
                    <button onClick={() => addToCart(prod.id)}>
                      {t('home.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress />
          </div>
        )}
      </section>

      {/* Banner */}
      <div>
        <img
          src={bannerNovedades} 
          alt={t('home.newsBannerAlt')}
          style={{
            width: "100%",
            height: "350px",
            objectFit: "cover"
          }}
        />
      </div>

      {/* Quizás te interesen */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.mayInterestYou')}</h2>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress />
          </div>
        ) : products.length > 0 ? (
          <div className="carousel-container">
            <div className="carousel-items" ref={interesRef}>
              {products.slice(0, 9).map((prod) => (
                <div className="product-card" key={prod.id} style={{ position: "relative" }}>
                  <IconButton
                    onClick={() => toggleFavorite(prod.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    {favoriteIds.includes(prod.id) ? (
                      <Favorite sx={{ color: "white" }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>

                  <Link
                    to={`/${lang}/producto/${prod.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="image-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                      {prod.imagen_url ? (
                        <img
                          src={prod.imagen_url}
                          alt={prod.nombre_producto}
                          onError={(e) => { e.currentTarget.src = noImage; }}
                        />
                      ) : (
                        <CircularProgress />
                      )}
                    </div>
                    <h5>{prod.nombre_producto}</h5>
                    <p>{formatCOP(prod.precio_producto)}</p>
                  </Link>

                  <div className="actions">
                    <button onClick={() => addToCart(prod.id)}>
                      {t('home.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress />
          </div>
        )}
      </section>

      {/* Banner rotativo */}
      <RotatingBanner />
    </div>
  );
}

export default Inicio;
