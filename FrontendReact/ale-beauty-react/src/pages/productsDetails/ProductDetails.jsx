import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Rating from "@mui/material/Rating";
import { FaStar } from "react-icons/fa";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import "../../assets/stylesheets/ProductDetails.css";
import userFoto from "../../assets/images/user_default.png";
import { formatCOP } from "../../services/currency";
import { BsCart4 } from "react-icons/bs";
import Skeleton from "@mui/joy/Skeleton";
import noImage from "../../assets/images/no_image.png";
import { useOutletContext } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import RatingSummary from "../../components/RatingSummary";
import "../../assets/stylesheets/RatingSummary.css";
import RateReviewIcon from '@mui/icons-material/RateReview';
import "../../assets/stylesheets/ProductosCliente.css";
import { useAlert } from "../../components/AlertProvider.jsx";
import { addItem as addGuestItem } from "../../utils/guestCart";
import DiscountIcon from '@mui/icons-material/Discount';
import Tooltip from '@mui/material/Tooltip';

function ProductDetails() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
  const normalizeToken = (raw) =>
    raw && raw !== "null" && raw !== "undefined" ? raw : null;
  const { slug } = useParams();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState(null); 
  const [token, setToken] = useState(() => normalizeToken(localStorage.getItem("token")));
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  const isFavorite = product ? favoriteIds.includes(product.id) : false;
  const [reviews, setReviews] = useState([]);
  const [productRatings, setProductRatings] = useState({});

  const averageRating = reviews.length > 0 
  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
  : 0;
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [newReview, setNewReview] = useState({ rating: 0, comentario: "" });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [ratings, setRatings] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState(null);
  const { addAlert } = useAlert();


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

  useEffect(() => {
    const onStorage = () => setToken(normalizeToken(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  // Cargar producto + carrito + favoritos
  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);

    // Producto (público)
    fetch(`${API_BASE}/api/v1/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error loading product");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProduct(data);

        // Relacionados (público)
        return fetch(`${API_BASE}/api/v1/products`)
          .then((r) => r.json())
          .then((allProducts) => {
            if (cancelled) return;
            const filtered = (Array.isArray(allProducts) ? allProducts : [])
              .filter((p) => p.sub_category?.category?.id === data.sub_category?.category?.id && p.id !== data.id)
              .slice(0, 5);
            setRelatedProducts(filtered);
          });
      })
      .catch(() => {
        if (!cancelled) setError(t("productDetails.loadError") || "No se pudo cargar el producto");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Carrito (solo autenticado)
    if (token) {
      fetch(`${API_BASE}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => setCart(data.cart || data))
        .catch(() => {});
    } else {
      setCart(null);
    }

    return () => { cancelled = true; };
  }, [slug, token, t]);


    useEffect(() => {
      if (!product) return;
      window.gtag && window.gtag('event', 'view_item', {
        items: [{
          item_id: product.id,
          item_name: product.nombre_producto,
          price: product.precio_producto,
          item_category: product.sub_category?.category?.nombre_categoria,
          item_variant: product.sku || '',
        }]
      });
    }, [product]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    setLoadingReviews(true);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchReviews = fetch(`${API_BASE}/api/v1/products/${slug}/reviews`, { headers })
      .then(async (res) => {
        if (res.status === 401) return []; // si el backend aún no es público para reseñas
        if (!res.ok) throw new Error();
        return res.json();
      })
      .catch(() => []);

    const fetchCanReview = token
      ? fetch(`${API_BASE}/api/v1/products/${slug}/can_review`, { headers })
          .then((res) => res.ok ? res.json() : { can_review: false })
          .catch(() => ({ can_review: false }))
      : Promise.resolve({ can_review: false });

    Promise.all([fetchReviews, fetchCanReview])
      .then(([reviewsData, canReviewData]) => {
        if (cancelled) return;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        (Array.isArray(reviewsData) ? reviewsData : []).forEach((r) => { ratingCount[r.rating] += 1; });
        setRatings(ratingCount);
        setCanReview(!!canReviewData.can_review);
      })
      .finally(() => !cancelled && setLoadingReviews(false));

    return () => { cancelled = true; };
  }, [product, slug, token]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://localhost:4000/api/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(t("profile.loadError"));
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => console.error(err));
  }, [t]);
  


  function ProductImage({ product, noImage }) {
    return (
      <div className="product-image" style={{ 
        position: "relative", 
        maxWidth: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        {!imgLoaded && (
          <Skeleton
            variant="rectangular"
            width={"400px"}
            height={400}
          />
        )}

        <img
          src={product.imagen_url || noImage}
          alt={product.nombre_producto}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = noImage;
            setImgLoaded(true);
          }}
          style={{
            width: "100%",
            height: "400px",
            display: imgLoaded ? "block" : "none",
            objectFit: "contain",
          }}
        />
      </div>
    );
  }

  if (!product) {
    return(
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        gap: "16px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #ff4d94",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const activeBtnStyle = {
    borderBottom: "3px solid #e91e63",
    fontWeight: "700",
    color: "#e91e63",
    borderRadius: "0",
    border: "none",
    backgroundColor: "transparent",
    padding: "12px 24px",
    fontSize: "16px",
    transition: "all 0.3s ease"
  };

  const inactiveBtnStyle = {
    borderBottom: "2px solid transparent",
    fontWeight: "500",
    color: "#666",
    border: "none",
    borderRadius: "0",
    backgroundColor: "transparent",
    padding: "12px 24px",
    fontSize: "16px",
    transition: "all 0.3s ease"
  };

  function ProductRating({ value = 0, count = 0 }) {
    return (
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <Rating
          name="product-rating"
          value={Number(value) || 0}
          precision={0.5}
          readOnly
          sx={{
            color: "#e91e63",
            fontSize: "1.2rem"
          }}
        />
        <Typography variant="body1" sx={{ ml: 1, fontWeight: "600", color: "#333" }}>
          {Number(value).toFixed(1)} · {count} {t("productDetails.reviews")}
        </Typography>
      </Box>
    );
  }

  function ProductDescription({ description }) {
    const limit = 150;

    if (!description) return null;

    const shortText =
      description.length > limit
        ? description.substring(0, limit) + "..."
        : description;

    const handleScroll = () => {
      const detailsSection = document.getElementById("detalles-producto");
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    return (
      <p style={{ 
        lineHeight: "1.6", 
        fontSize: "16px", 
        overflowWrap: "anywhere", 
        marginBottom: "0", 
        marginTop: "10px",
        color: "#555"
      }}>
        {shortText}
        {description.length > limit && (
          <a
            href="#detalles-producto"
            onClick={(e) => {
              e.preventDefault();
              handleScroll();
            }}
            style={{
              marginLeft: "8px",
              color: "#e91e63",
              cursor: "pointer",
              textDecoration: "none",
              fontWeight: "600",
              borderBottom: "1px solid #e91e63"
            }}
          >
            {t("productDetails.viewMore")}
          </a>
        )}
      </p>
    );
  }

  

  const handleBuyNow = (productId, quantity = 1) => {
    fetch("https://localhost:4000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order: {
          products: [
            { product_id: productId, quantity: quantity }
          ]
        }
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Buy now failed");
        return res.json();
      })
      .then((data) => {
        if (data.order) {
          navigate(`/${lang}/checkout`, {
            state: {
              orderId: data.order.id,
              total: data.order.pago_total
            }
          });
        } else {
          setError(t("cart.orderError"));
        }
      })
      .catch(() => setError(t("cart.orderError")));
  };


  const addToCart = (item) => {
    const tok = normalizeToken(localStorage.getItem("token") || token);

    // item puede ser objeto o id: resuélvelo para guest
    const prod =
      typeof item === "object"
        ? item
        : (product && String(product.id) === String(item))
          ? product
          : (Array.isArray(relatedProducts) ? relatedProducts.find((p) => String(p.id) === String(item)) : null);

    const productId = prod?.id ?? item;

    // Invitado: localStorage + eventos
    if (!tok) {
      window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", { bubbles: false }));
      if (prod) addGuestItem(prod, 1); // emite guestCartUpdated
      window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
      addAlert(t("productDetails.addedToCart") || "Se agregó al carrito", "success", 3500);
      return;
    }

    // Autenticado: backend + eventos
    window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", { bubbles: false, detail: { productId, action: "add" } }));

    fetch(`${API_BASE}/api/v1/cart/add_product`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        try { return await res.json(); } catch { return {}; }
      })
      .then((data) => {
        const serverCart = data?.cart || data; // acepta ambos formatos
        if (serverCart?.products) {
          setCart(serverCart);
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
          addAlert(t("productDetails.addedToCart") || "Se agregó al carrito", "success", 3500);
        } else {
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        }
      })
      .catch(() => {
        addAlert(t("productDetails.cartAddError") || "No se pudo agregar al carrito", "error", 3500);
        window.dispatchEvent(new CustomEvent("cartUpdateFailed", { bubbles: false, detail: { productId, action: "add" } }));
      });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://localhost:4000/api/v1/products/${product.slug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      const data = await res.json();

      if (res.ok) {
        setReviews((prev) => [...prev, data]);
        setNewReview({ rating: 0, comentario: "" });
        setShowReviewForm(false);
      } else {
        alert("Error al enviar reseña: " + (data.errors || "desconocido"));
      }
    } catch (err) {
      console.error("Error enviando reseña:", err);
      alert("No se pudo enviar la reseña");
    }
  };

  const handleOpenReviewForm = () => {
    if (!canReview) {
      addAlert("Solo puedes reseñar productos que hayas comprado", "warning", 5000);
      return;
    }

    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  const toggleFavorite = async (productId) => {
    const tok = normalizeToken(localStorage.getItem("token") || token);
    if (!tok) {
      addAlert(t("productDetails.loginToFavorite") || "Inicia sesión para gestionar favoritos", "info", 3500);
      return;
    }
    try {
      if (favoriteIds.includes(productId)) {
        const res = await fetch(`${API_BASE}/api/v1/favorites/${productId}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${tok}` },
        });
        if (res.ok) {
          await loadFavorites();
          addAlert("se elimino de tus favoritos", "warning", 3500);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/v1/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites();
          addAlert("se agregó a tus favoritos", "success", 3500);
        }
      }
    } catch {
      addAlert("Algo salió mal", "error", 3500);
    }
  };

  // Calcular precios con descuento
  const priceOriginal = product.precio_producto;
  const priceDiscount = product.precio_con_mejor_descuento;
  const discount = product.mejor_descuento_para_precio;

  const tooltipContent = (
    <Typography
      sx={{
        color: "#4caf50",
        fontWeight: 600,
        fontSize: "15px",
        marginTop: "0",
        backgroundColor: "#e8f5e8",
        padding: "4px 12px",
        borderRadius: "5px",
        display: "inline-block"
      }}
    >
      {discount.nombre}
    </Typography>
  );

  return (
    <div className="product-details-page" style={{
      marginTop: "60px",
      maxWidth: "1200px",
      margin: "60px auto 0",
      padding: "0 20px"
    }}>
      <div className="product-container" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start",
        marginBottom: "60px"
      }}>
        <ProductImage product={product} noImage={noImage} />

        <div className="product-info" style={{
          padding: "20px 0"
        }}>
          <div className="title-category" style={{ width: "100%" }}>
            <p className="negrita" style={{
              color: "#e91e63",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
              textAlign: "left"
            }}>{product.sub_category?.category?.nombre_categoria} / {product.sub_category?.nombre}</p>
            <div style={{ 
              display: "flex", 
              flexDirection: "row",
              justifyContent: "space-between", 
              alignItems: "flex-start",
              marginBottom: "16px",
              width: "100%"
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#333",
                  lineHeight: "1.3",
                  margin: "0",
                  textAlign: "left"
                }}>{product.nombre_producto} <Tooltip
                    title={tooltipContent}
                    placement="right"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'transparent',
                          boxShadow: 'none',
                          padding: 0,
                        },
                      },
                    }}
                  >
                    
                    <DiscountIcon
                      sx={{
                        color: "#e91e63",
                        fontSize: "20px",
                        marginLeft: "8px"
                      }}
                    />
                  </Tooltip>
                  </h2>
              </div>

              <IconButton 
                id="favBtn" 
                onClick={() => toggleFavorite(product.id)}
                sx={{
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": { 
                    bgcolor: "grey.50",
                    transform: "scale(1.1)"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                {isFavorite ? (
                  <Favorite sx={{ color: "#e91e63", fontSize: "28px" }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: "28px" }} />
                )}
              </IconButton>
            </div>
            
          </div>
          <div style={{ width: "100%", textAlign: "left" }}>
            <ProductRating value={averageRating} count={reviews.length} />
          </div>

          <br></br>
          
          {/* Precio con descuento */}
          <div style={{ marginBottom: "30px", textAlign: "left" }}>
            {priceDiscount && priceDiscount < priceOriginal ? (
              <>
                <span style={{ 
                  textDecoration: "line-through", 
                  color: "#999", 
                  marginLeft: "4px", 
                  fontSize: "18px",
                  fontWeight: "400"
                }}>
                  {formatCOP(priceOriginal)}
                </span>
                <p className="price" style={{ 
                  color: "#e91e63", 
                  fontWeight: "700", 
                  marginBottom: "4px",
                  fontSize: "28px"
                }}>
                  {formatCOP(priceDiscount)}
                  
                  
                  {discount && discount.tipo === "porcentaje" && (
                    <p style={{ 
                      color: "#4caf50", 
                      fontWeight: 600, 
                      fontSize: "20px", 
                      marginTop: "0",
                      padding: "4px 12px",
                      display: "inline-block"
                    }}>
                      {discount.valor}%
                    </p>
                  )}

                </p>
                
              </>
            ) : (
              <p className="price" style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#333"
              }}>{formatCOP(priceOriginal)}</p>
            )}
          </div>

          <div className="actions" style={{
            display: "flex",
            gap: "16px",
            marginTop: "30px"
          }}>
            <button 
              onClick={() => handleBuyNow(product.id)}
              style={{
                flex: 2,
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: "#e91e63",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(233, 30, 99, 0.3)"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#d81b60";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(233, 30, 99, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#e91e63";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(233, 30, 99, 0.3)";
              }}
            >
              {t("productDetails.buy")}
            </button>

            <button 
              onClick={() => addToCart(product)}
              style={{
                padding: "14px",
                backgroundColor: "white",
                border: "2px solid #e91e63",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#fff5f7";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.transform = "scale(1)";
              }}
            >
              <BsCart4 size={24} color="#e91e63" />
            </button>
          </div>
        </div>
      </div>

    <section id="detalles-producto" className="details-reviews-container" style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "32px",
      boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      marginBottom: "60px"
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        borderBottom: '2px solid #f0f0f0', 
        marginBottom: '2rem' 
      }}>
        <button 
          className="botonTap"
          onClick={() => setActiveTab("description")} 
          style={activeTab === "description" ? activeBtnStyle : inactiveBtnStyle}
        >
          {t("productDetails.description")}
        </button>

        <button 
          className="botonTap"
          onClick={() => setActiveTab("reviews")} 
          style={activeTab === "reviews" ? activeBtnStyle : inactiveBtnStyle}
        >
          {t("productDetails.reviews")} ({reviews.length})
        </button>
      </div>

      {activeTab === "description" && (
        <div className="description-section">
          <p style={{ 
            color: '#555',
            overflowWrap: "anywhere",
            lineHeight: "1.7",
            fontSize: "16px"
          }}>
            {product.descripcion}
          </p>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="reviews-section">
          <div id="areaRating" style={{ marginBottom: "32px" }}>
            <RatingSummary 
            ratings={ratings} 
            showReviewForm={showReviewForm} 
            onOpenReviewForm={handleOpenReviewForm}
            onCloseReviewForm={handleCloseReviewForm}
            productName={product.nombre_producto}
            />
            
          </div>

          {showReviewForm && canReview && (
            <div id="formReviewCard" style={{ 
              marginTop: "2rem",
              backgroundColor: "#f8f9fa",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e9ecef"
            }}>
              <form onSubmit={handleSubmitReview} style={{ gap: 0 }}>
                <textarea
                  id="textReview"
                  placeholder={t("productDetails.writeReview")}
                  value={newReview.comentario}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comentario: e.target.value })
                  }
                  rows={4}
                  style={{ 
                    width: "100%", 
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    fontSize: "14px",
                    resize: "vertical",
                    marginBottom: "16px",
                    fontFamily: "inherit"
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Rating
                    name="new-rating"
                    value={newReview.rating}
                    onChange={(e, value) =>
                      setNewReview({ ...newReview, rating: value })
                    }
                    sx={{ color: "#e91e63" }}
                    size="large"
                  />
                  <div>
                    <button 
                      type="submit" 
                      id="ReviewUP"
                      style={{
                        backgroundColor: "#e91e63",
                        color: "white",
                        border: "none",
                        padding: "10px 24px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#d81b60";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#e91e63";
                      }}
                    >
                      {t("productDetails.submitReview")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }}/>

          <h3 style={{ 
            marginBottom: "24px",
            color: "#333",
            fontSize: "20px",
            fontWeight: "600"
          }}>
            {t("productDetails.reviews")} ({reviews.length})
          </h3>

          {loadingReviews ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <CircularProgress sx={{ color: "#e91e63" }} />
            </div>
          ) : (
            <>
              <div>
                {reviews.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666"
                  }}>
                    <RateReviewIcon sx={{ fontSize: 48, color: "#ddd", mb: 2 }} />
                    <p style={{ fontSize: "16px" }}>{t("productDetails.noReviews")}</p>
                  </div>
                ) : (
                  reviews.slice(0, visibleReviews).map((review) => (
                    <div
                      key={review.id}
                      style={{
                        backgroundColor: "#fafafa",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "16px",
                        border: "1px solid #f0f0f0",
                        transition: "all 0.2s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                        <img
                          src={review.user?.avatar_url || userFoto}
                          alt={review.user?.nombre || "Usuario"}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #fff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "8px"
                            }}
                          >
                            <div>
                              <strong style={{ color: "#222", fontSize: "16px", display: "block" }}>
                                {review.user?.nombre || "Usuario"}
                              </strong>
                              <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
                                {new Date(review.created_at).toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <Rating 
                              value={review.rating} 
                              readOnly 
                              sx={{ color: "#e91e63" }} 
                              size="medium" 
                            />
                          </div>

                          <p
                            style={{
                              color: "#444",
                              fontSize: "15px",
                              lineHeight: "1.6",
                              margin: "12px 0 0 0",
                            }}
                          >
                            {review.comentario}
                          </p>

                        </div>
                      </div>
                    </div>

                  ))
                )}
              </div>

              {reviews.length > visibleReviews && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button 
                    onClick={() => setVisibleReviews((prev) => prev + 5)} 
                    style={{ 
                      backgroundColor: "#e91e63", 
                      color: "white", 
                      padding: "12px 24px", 
                      borderRadius: "6px",
                      border: "none",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#d81b60";
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#e91e63";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    {t("productDetails.viewMore")} ({reviews.length - visibleReviews} {t("productDetails.more")})
                  </button>
                </div>
              )}

              {visibleReviews > 5 && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button 
                    onClick={() => setVisibleReviews(5)} 
                    style={{ 
                      backgroundColor: "transparent", 
                      color: "#666", 
                      padding: "8px 16px", 
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    {t("productDetails.viewLess")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

    </section>


      {relatedProducts && relatedProducts.length > 0 ?(
        <section className="related-products" style={{ marginBottom: "60px" }}>
          <h3 style={{ 
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "8px"
          }}>
            {t("productDetails.relatedproducts")}
          </h3>

          <div className="carousel-container" style={{ overflowX: "auto", paddingBottom: "20px" }}>
            <div className="carousel-items" style={{
              display: "flex",
              gap: "24px",
              padding: "0 10px"
            }}>
              {relatedProducts
                .filter((rp) => rp.subcategoria_id === product.subcategoria_id)
                .slice(0, 4)
                .map((rp) => {
                  const rpPriceOriginal = rp.precio_producto;
                  const rpPriceDiscount = rp.precio_con_mejor_descuento;
                  const rpDiscount = rp.mejor_descuento_para_precio;

                  return (
                    <div
                      key={rp.id}
                      style={{ 
                        position: "relative",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        width: "250px",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.1)";
                      }}
                    >
                      <IconButton
                        onClick={() => toggleFavorite(rp.id)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          "&:hover": { 
                            bgcolor: "grey.200",
                            transform: "scale(1.1)"
                          },
                          transition: "all 0.2s ease",
                          zIndex: 2
                        }}
                      >
                        {favoriteIds.includes(rp.id) ? (
                          <GradientHeart filled />
                        ) : (
                          <GradientHeart filled={false} />
                        )}
                      </IconButton>

                      <Link
                        to={`/${lang}/producto/${rp.slug}`}
                        style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", flexDirection: "column" }}
                      >
                        <div style={{
                          height: "200px",
                          overflow: "hidden",
                          position: "relative"
                        }}>
                          <img
                            src={rp.imagen_url || noImage}
                            alt={rp.nombre_producto}
                            onError={(e) => {
                              e.currentTarget.src = noImage;
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              transition: "transform 0.3s ease"
                            }}
                          />
                        </div>

                        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#333",
                            marginBottom: "8px",
                            lineHeight: "1.4",
                            minHeight: "44px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}>
                            {rp.nombre_producto}
                          </div>
                          
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px"
                          }}>
                            <span style={{
                              fontSize: "18px",
                              fontWeight: "700"
                            }}>
                              {rpPriceDiscount && rpPriceDiscount < rpPriceOriginal ? (
                                <>
                                  <span style={{ color: "#e91e63" }}>
                                    {formatCOP(rpPriceDiscount)}
                                  </span>
                                  <span style={{ 
                                    textDecoration: "line-through", 
                                    color: "#999", 
                                    marginLeft: "8px", 
                                    fontSize: "14px",
                                    fontWeight: "400"
                                  }}>
                                    {formatCOP(rpPriceOriginal)}
                                  </span>
                                </>
                              ) : (
                                formatCOP(rpPriceOriginal)
                              )}
                            </span>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="#FFC107"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                  marginRight: "4px"
                                }}
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              <span style={{
                                fontSize: "14px",
                                color: "#666"
                              }}>
                                {productRatings[rp.id]?.avg
                                  ? Number(productRatings[rp.id]?.avg).toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Mostrar porcentaje si aplica */}
                          {rpDiscount && rpDiscount.tipo === "porcentaje" && rpPriceDiscount < rpPriceOriginal && (
                            <div style={{ 
                              color: "#4caf50", 
                              fontWeight: 600, 
                              fontSize: "12px", 
                              backgroundColor: "#e8f5e8",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              display: "inline-block",
                              alignSelf: "flex-start",
                              marginTop: "4px"
                            }}>
                              {rpDiscount.valor}% OFF
                            </div>
                          )}
                        </div>
                      </Link>

                      <div style={{ padding: "0 16px 16px" }}>
                        <button
                          onClick={() => addToCart(rp.id)}
                          style={{
                            width: "100%",
                            backgroundColor: "#e91e63",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "6px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#d81b60";
                            e.target.style.transform = "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#e91e63";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          {t("home.addToCart")}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      ) : (
        <section className="related-products" style={{ marginBottom: "60px" }}>
          <h3 style={{ 
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "32px"
          }}>
            {t("productDetails.relatedproducts")}
          </h3>

          <div className="carousel-container" style={{ overflowX: "auto", paddingBottom: "20px" }}>
            <div className="carousel-items" style={{
              display: "flex",
              gap: "24px",
              padding: "0 10px"
            }}>
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  width: "280px",
                  flexShrink: 0
                }}>
                  <div style={{ marginBottom: "12px" }}>
                    <Skeleton variant="rectangular" width={"100%"} height={200} sx={{ borderRadius: "8px" }} />
                  </div>
                  <Skeleton variant="text" width={150} height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={80} height={20} sx={{ mb: 2 }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: "6px" }} />
                    <Skeleton variant="circular" width={36} height={36} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

export default ProductDetails;