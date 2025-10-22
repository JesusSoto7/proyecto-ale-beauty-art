import React, { useEffect, useState, useRef } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import { Link, useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { formatCOP } from '../../services/currency';
import bannerNovedades from '../../assets/images/bannerNovedades.jpg'
import { useOutletContext } from "react-router-dom";
import noImage from "../../assets/images/no_image.png";
import RotatingBanner from "./RotatingBanner";
import { useTranslation } from 'react-i18next';
import Rating from "@mui/material/Rating";
import FloatingChat from '../../components/FloatingChat';
import BannerProduct from '../../components/bannerProducts';
// import "../../assets/stylesheets/ProductosCliente.css";
import "../../assets/stylesheets/RankingPro.css";
import RankingPro from '../../components/rankingPro.jsx';
import PositiveReviews from "../../components/positiveReviews.jsx";


function Inicio() {
  // const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  const [newProducts, setNewProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const { slug } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [ratings, setRatings] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  
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

  function GradientHeart({ filled = false, size = 36 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ display: "block" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heart-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#cf0d5bff"/>
            <stop offset="1" stopColor="#f7c1dcff"/>
          </linearGradient>
        </defs>
        <path
          d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
          fill={filled ? "url(#heart-gradient)" : "none"}
          stroke="url(#heart-gradient)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  // Cargar ratings de productos
  const loadProductRatings = async (productList) => {
    const ratingsObj = {};
    
    await Promise.all(productList.map(async (product) => {
      try {
        const res = await fetch(`https://localhost:4000/api/v1/products/${product.slug}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reviews = await res.json();
        if (Array.isArray(reviews) && reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          ratingsObj[product.id] = { 
            avg, 
            count: reviews.length 
          };
        } else {
          ratingsObj[product.id] = { avg: 0, count: 0 };
        }
      } catch (error) {
        console.error(`Error cargando rating para producto ${product.id}:`, error);
        ratingsObj[product.id] = { avg: 0, count: 0 };
      }
    }));
    
    setProductRatings(ratingsObj);
  };

  // Cargar productos + favoritos del usuario
    useEffect(() => {
    // Productos e inicio
    fetch('https://localhost:4000/api/v1/inicio')
      .then(res => res.json())
      .then(data => {
        // ✅ MOSTRAR PÁGINA INMEDIATAMENTE
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setLoading(false); // ← Página visible YA

        // ✅ Cargar ratings DESPUÉS (no bloquear)
        if (data.products && data.products.length > 0) {
          // Solo cargar 4 ratings iniciales
          setTimeout(() => {
            loadProductRatings(data.products.slice(0, 4), false);
          }, 500);
        }
      })
      .catch(err => {
        console.error(t('home.loadError'), err);
        setLoading(false);
      });

    // Novedades (en paralelo, no esperar)
    fetch('https://localhost:4000/api/v1/products/novedades', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setNewProducts(data);
        // Ratings después también
        setTimeout(() => {
          if (Array.isArray(data) && data.length > 0) {
            loadProductRatings(data.slice(0, 4), true);
          }
        }, 800);
      })
      .catch(err => console.error("Error cargando novedades", err));

    // Carrito (no esperar tampoco)
    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error(t('home.cartError'), err));

    // Favoritos (no esperar tampoco)
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
    fetch("https://localhost:4000/api/v1/cart/add_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          setCart(data.cart);
          // Disparar evento para actualizar el Header
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));

          // === Evento GA4: add_to_cart ===
          // Busca el producto agregado en el array del carrito actualizado
          const product = data.cart.products.find(p => p.product_id === productId);
          if (window.gtag && product) {
            window.gtag("event", "add_to_cart", {
              currency: "COP",
              value: product.precio_producto,
              items: [
                {
                  item_id: product.product_id,
                  item_name: product.nombre_producto,
                  price: product.precio_producto,
                  quantity: product.cantidad,
                },
              ],
            });
            console.log("🛒 Evento GA4 enviado: add_to_cart", product);
          }
          // ===============================
        } else if (data.errors) {
          alert(t('productDetails.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        alert(t('productDetails.cartAddError'));
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
      {/* {loading ? (
        <Skeleton sx={{ bgcolor: 'grey.800' }} variant="rectangular" width={"100%"} height={350} />
      ) : carousel.length > 0 ? (
        <Carousel interval={3000} className="mb-0">
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx} sx={{ marginTop: "70px"}}>
              <img
                className="d-block w-100"
                src={img}
                alt={`${t('home.slide')} ${idx + 1}`}
                style={{ height: "450px", objectFit: "cover" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : null} */}



      {/* Sección Novedades Maquillaje */}
      <section className="mt-5">
        <h2 className="mb-4">{t('home.newMakeup')}</h2>
        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4].map((skeleton) => (
                <div className="product-card" key={skeleton}>
                  <div className="image-container">
                    <Skeleton variant="rectangular" width={"100%"} height={200} />
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
        ) : newProducts.length > 0 ? (
          <div className="carousel-container">
            <button
              className="carousel-btn prev"
              onClick={() => {
                document.querySelector(".carousel-items")
                  .scrollBy({ left: -300, behavior: "smooth" });
              }}
            >
              ❮
            </button>

            <div className="carousel-items">
              {newProducts.map((prod) => (
                <div className="custom-product-card" key={prod.id}>
                  <div className="custom-image-wrapper">
                    <img
                      src={prod.imagen_url || noImage}
                      alt={prod.nombre_producto}
                      onError={(e) => { e.currentTarget.src = noImage; }}
                    />
                    <IconButton
                      onClick={() => toggleFavorite(prod.id)}
                      className="custom-favorite-btn"
                      sx={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        bgcolor: "white",
                        boxShadow: 2,
                        borderRadius: "50%",
                        zIndex: 2
                      }}
                    >
                      {favoriteIds.includes(prod.id)
                        ? <GradientHeart filled />
                        : <GradientHeart filled={false} />
                      }
                    </IconButton>
                  </div>
                  <Link to={`/${lang}/producto/${prod.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="custom-product-info">
                      <div className="custom-product-name-v2">{prod.nombre_producto}</div>
                      <div className="custom-price-v2">
                        {prod.precio_con_mejor_descuento && prod.precio_con_mejor_descuento < prod.precio_producto ? (
                          <>
                            <span>{formatCOP(prod.precio_con_mejor_descuento)}</span>
                            <span className="line-through">{formatCOP(prod.precio_producto)}</span>
                          </>
                        ) : (
                          <span>{formatCOP(prod.precio_producto)}</span>
                        )}
                      </div>
                      <div className="custom-rating-row-v2">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFC107" style={{ marginRight: "2px", verticalAlign: "middle" }}>
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        <span className="custom-rating-number-v2">
                          {productRatings[prod.id]?.avg
                            ? Number(productRatings[prod.id]?.avg).toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                      {prod.mejor_descuento_para_precio && (
                        <div className="custom-descuento-nombre">
                          {prod.mejor_descuento_para_precio.nombre}
                          {prod.mejor_descuento_para_precio.tipo === "porcentaje"
                            ? ` (${prod.mejor_descuento_para_precio.valor}%)`
                            : ` (-${formatCOP(prod.mejor_descuento_para_precio.valor)})`}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="custom-card-footer">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        addToCart(prod.id);
                      }}
                      className="custom-add-btn"
                    >
                      {t('home.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="carousel-btn next"
              onClick={() => {
                document.querySelector(".carousel-items")
                  .scrollBy({ left: 300, behavior: "smooth" });
              }}
            >
              ❯
            </button>
          </div>
        ) : (
          <p>{t('home.noProducts')}</p>
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

      {/* Banner delgado en movimiento */}
      <div className="banner-ticker">
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
                    <Skeleton variant="rectangular" width={"100%"} height={200} />
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
        ) : products.length > 0 ? (
          <div className="carousel-container">

            <div className="carousel-items" ref={interesRef}>
              {products.slice(0, 9).map((prod) => (
                  <div className="custom-product-card" key={prod.id}>
                    <div className="custom-image-wrapper">
                      <img
                        src={prod.imagen_url || noImage}
                        alt={prod.nombre_producto}
                        onError={(e) => { e.currentTarget.src = noImage; }}
                      />
                      <IconButton
                        onClick={() => toggleFavorite(prod.id)}
                        className="custom-favorite-btn"
                        sx={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          bgcolor: "white",
                          boxShadow: 2,
                          borderRadius: "50%",
                          zIndex: 2
                        }}
                      >
                        {favoriteIds.includes(prod.id)
                          ? <GradientHeart filled />
                          : <GradientHeart filled={false} />
                        }
                      </IconButton>
                    </div>
                    <Link to={`/${lang}/producto/${prod.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="custom-product-info">
                        <div className="custom-product-name-v2">{prod.nombre_producto}</div>
                        <div className="custom-price-v2">
                          {prod.precio_con_mejor_descuento && prod.precio_con_mejor_descuento < prod.precio_producto ? (
                            <>
                              <span>{formatCOP(prod.precio_con_mejor_descuento)}</span>
                              <span className="line-through">{formatCOP(prod.precio_producto)}</span>
                            </>
                          ) : (
                            <span>{formatCOP(prod.precio_producto)}</span>
                          )}
                        </div>
                        <div className="custom-rating-row-v2">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFC107" style={{ marginRight: "2px", verticalAlign: "middle" }}>
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                          <span className="custom-rating-number-v2">
                            {productRatings[prod.id]?.avg
                              ? Number(productRatings[prod.id]?.avg).toFixed(1)
                              : "0.0"}
                          </span>
                        </div>
                        {prod.mejor_descuento_para_precio && (
                          <div className="custom-descuento-nombre">
                            {prod.mejor_descuento_para_precio.nombre}
                            {prod.mejor_descuento_para_precio.tipo === "porcentaje"
                              ? ` (${prod.mejor_descuento_para_precio.valor}%)`
                              : ` (-${formatCOP(prod.mejor_descuento_para_precio.valor)})`}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="custom-card-footer">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          addToCart(prod.id);
                        }}
                        className="custom-add-btn"
                      >
                        {t('home.addToCart')}
                      </button>
                    </div>
                  </div>
              ))}
            </div>

          </div>
        ) : (
          <p>{t('home.noProducts')}</p>
        )}
      </section>
      <FloatingChat />
      <BannerProduct products={products} productRatings={productRatings}/>

      {/* Banner rotativo */}
      <RotatingBanner />
      <h2 className="mb-4">productos mejor valorados</h2>
      <RankingPro products={products} productRatings={productRatings} loading={loading} />
      
      {/* <h2 className="mb-4">comentarios destacados</h2> */}
      {/* <PositiveReviews reviews={reviews} loading={loadingReviews} /> */}

      
    </div>
  );
}

export default Inicio;