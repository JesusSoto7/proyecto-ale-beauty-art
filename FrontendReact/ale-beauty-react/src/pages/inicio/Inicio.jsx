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

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  const [newProducts, setNewProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});

  
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

        // Novedades
        fetch('https://localhost:4000/api/v1/products/novedades', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
          .then(res => res.json())
          .then(data => {
            setNewProducts(data);
            // Cargar ratings para productos nuevos
            if (Array.isArray(data) && data.length > 0) {
              loadProductRatings(data);
            }
          })
          .catch(err => console.error("Error cargando novedades", err));

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
              
              // Cargar ratings para todos los productos
              if (data.products && data.products.length > 0) {
                loadProductRatings(data.products);
              }
              
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

    // Favoritos del usuario
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
      {loading ? (
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
      ) : null}

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
                    <div className="image-container">
                      <img
                        src={prod.imagen_url || noImage}
                        alt={prod.nombre_producto}
                        onError={(e) => { e.currentTarget.src = noImage; }}
                      />
                    </div>
                    
                    {/* Rating de estrellas CENTRADO */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginBottom: "5px",
                      width: "100%"
                    }}>
                      <Rating
                        name={`product-rating-${prod.id}`}
                        value={productRatings[prod.id]?.avg || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ color: "#ffc107" }}
                      />
                      <span style={{ fontSize: "14px", marginLeft: "4px" }}>
                        {productRatings[prod.id]?.avg ? productRatings[prod.id].avg.toFixed(1) : "0.0"}
                      </span>
                    </div>
                    
                    <h5 style={{ textAlign: "center", margin: "5px 0" }}>{prod.nombre_producto}</h5>
                    <p style={{ textAlign: "center", margin: "5px 0" }}>{formatCOP(prod.precio_producto)}</p>
                  </Link>

                  <div className="actions">
                    <button onClick={() => addToCart(prod.id)}>
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
                    <div className="image-container">
                      <img
                        src={prod.imagen_url || noImage}
                        alt={prod.nombre_producto}
                        onError={(e) => { e.currentTarget.src = noImage; }}
                      />
                    </div>
                    
                    {/* Rating de estrellas CENTRADO */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginBottom: "5px",
                      width: "100%"
                    }}>
                      <Rating
                        name={`product-rating-${prod.id}`}
                        value={productRatings[prod.id]?.avg || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ color: "#ffc107" }}
                      />
                      <span style={{ fontSize: "14px", marginLeft: "4px" }}>
                        {productRatings[prod.id]?.avg ? productRatings[prod.id].avg.toFixed(1) : "0.0"}
                      </span>
                    </div>
                    
                    <h5 style={{ textAlign: "center", margin: "5px 0" }}>{prod.nombre_producto}</h5>
                    <p style={{ textAlign: "center", margin: "5px 0" }}>{formatCOP(prod.precio_producto)}</p>
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
          <p>{t('home.noProducts')}</p>
        )}
      </section>
      <FloatingChat />

      {/* Banner rotativo */}
      <RotatingBanner />
    </div>
  );
}

export default Inicio;