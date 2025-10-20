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

function ProductDetails() {
  const { slug } = useParams();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState(null); 
  const [token] = useState(localStorage.getItem("token"));
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


  // Cargar producto + carrito + favoritos
  useEffect(() => {
    if (!token) {
      alert(t('productDetails.notAuthenticated'));
      return;
    }


    // cargar producto
    fetch(`https://localhost:4000/api/v1/products/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        fetch("https://localhost:4000/api/v1/products", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((allProducts) => {
            const filtered = allProducts
              .filter((p) => p.sub_category?.category?.id === data.sub_category?.category?.id && p.id !== data.id)
              .slice(0, 5);
            setRelatedProducts(filtered);

          })
          .catch((err) => console.error("Error cargando relacionados:", err));

      })
      .catch((err) => console.error(err));

      

    // cargar carrito
    fetch("https://localhost:4000/api/v1/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch((err) =>
        console.error(t('productDetails.cartError'), err)
      );
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
    setLoadingReviews(true);

    Promise.all([
      fetch(`https://localhost:4000/api/v1/products/${slug}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`https://localhost:4000/api/v1/products/${slug}/can_review`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([reviewsData, canReviewData]) => {
        setReviews(reviewsData);
        setCanReview(canReviewData.can_review);
      })
      .catch((err) => console.error("Error cargando reseñas/canReview:", err))
      .finally(() => setLoadingReviews(false));

    
  fetch(`https://localhost:4000/api/v1/products/${slug}/reviews`, { 
    headers: { Authorization: `Bearer ${token}` }}
  )
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);

        const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach((review) => {
          ratingCount[review.rating] += 1;
        });
        setRatings(ratingCount);
      })
      .catch((err) => console.error(err));

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
      <div className="product-image" style={{ position: "relative", maxWidth: "500px" }}>
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
    borderBottom: "2px solid #f896b8",
    fontWeight: "bold",
    color: "#f896b8",
    borderRadius: "none",
    backgroundColor: "transparent"
  };

  function ProductRating({ value = 0, count = 0 }) {
    return (
      <Box display="flex" alignItems="center">
        <Rating
          name="product-rating"
          value={Number(value) || 0}
          precision={0.5}
          readOnly
          sx={{
            color: "#f896b8",
          }}
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          ({Number(value).toFixed(1)}) ({count})
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
      <p style={{ lineHeight: "1.5", fontSize: "16px", overflowWrap: "anywhere", marginBottom: "0", marginTop: "10px" }}>
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
              color: "#f896b8",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "bold",
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
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        } else if (data.errors) {
          alert(t('productDetails.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        alert(t('productDetails.cartAddError'));
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
      } else {
        alert("Error al enviar reseña: " + (data.errors || "desconocido"));
      }
    } catch (err) {
      console.error("Error enviando reseña:", err);
      alert("No se pudo enviar la reseña");
    }
  };


  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites();
        }
      } else {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites();
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };

  // Calcular precios con descuento
  const priceOriginal = product.precio_producto;
  const priceDiscount = product.precio_con_mejor_descuento;
  const discount = product.mejor_descuento_para_precio;

  return (
    <div className="product-details-page" style={{marginTop: "60px"}}>
      <div className="product-container">
        <ProductImage product={product} noImage={noImage} />

        <div className="product-info">
          <div className="title-category">
            <p className="negrita">{product.sub_category?.category?.nombre_categoria}</p>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"
             }}>
              <h2>{product.nombre_producto}</h2>

              <IconButton id="favBtn" onClick={() => toggleFavorite(product.id)}>
                {isFavorite ? (
                  <Favorite sx={{ color: "white" }} />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            </div>
            
          </div>
          <ProductRating value={averageRating} count={reviews.length} />

          <br></br>
          
          {/* Precio con descuento */}
          <div>
            {priceDiscount && priceDiscount < priceOriginal ? (
              <>
                <p className="price" style={{ color: "#dc2626", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  {formatCOP(priceDiscount)}
                  <span style={{ textDecoration: "line-through", color: "#64748b", marginLeft: "1em", fontSize: "0.9em" }}>
                    {formatCOP(priceOriginal)}
                  </span>
                </p>
                {discount && discount.tipo === "porcentaje" && (
                  <p style={{ color: "#2563eb", fontWeight: 500, fontSize: "0.95rem", marginTop: "0" }}>
                    {discount.valor}% de descuento
                  </p>
                )}
              </>
            ) : (
              <p className="price">{formatCOP(priceOriginal)}</p>
            )}
          </div>

          <div className="actions">
            <button onClick={() => handleBuyNow(product.id)}>
              {t("productDetails.buy")}
            </button>

            <button onClick={() => addToCart(product.id)}>
              <BsCart4 size={25} />
            </button>
          </div>
        </div>
      </div>

    <section id="detalles-producto" className="details-reviews-container">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        borderBottom: '1px solid #eee', 
        marginBottom: '1rem' 
      }}>
        <button 
          className="botonTap"
          onClick={() => setActiveTab("description")} 
          style={activeTab === "description" ? activeBtnStyle : {}}
        >
          {t("productDetails.description")}
        </button>

        <button 
          className="botonTap"
          onClick={() => setActiveTab("reviews")} 
          style={activeTab === "reviews" ? activeBtnStyle : {}}
        >
          {t("productDetails.reviews")}
        </button>
      </div>

      {activeTab === "description" && (
        <div className="description-section">
          <p style={{ color: '#3d3d3dff', overflowWrap: "anywhere" }}>
            {product.descripcion}
          </p>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="reviews-section">
          <div id="areaRating" >
            <RatingSummary 
            ratings={ratings} 
            showReviewForm={showReviewForm} 
            setShowReviewForm={setShowReviewForm}
            productName={product.nombre_producto}
            />
            
          </div>

          {showReviewForm && canReview && (
            <div id="formReviewCard" style={{ marginTop: "1rem" }}>
              <form onSubmit={handleSubmitReview} style={{gap: 0}}>
                <textarea
                  id="textReview"
                  placeholder={t("productDetails.writeReview")}
                  value={newReview.comentario}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comentario: e.target.value })
                  }
                  rows={3}
                  style={{ width: "100%", border: "none", borderBottom: "solid 1px #ccc"}}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Rating
                    name="new-rating"
                    value={newReview.rating}
                    onChange={(e, value) =>
                      setNewReview({ ...newReview, rating: value })
                    }
                    sx={{ color: "#f896b8", marginLeft: 2 }}
                  />
                  <div>
                    <button type="submit" id="ReviewUP">
                      {t("productDetails.submitReview")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <hr/>

          <h3>{t("productDetails.reviews")}</h3>

          {loadingReviews ? (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <CircularProgress sx={{ color: "#f896b8" }} />
            </div>
          ) : (
            <>
              <div>
                {reviews.length === 0 ? (
                  <p>{t("productDetails.noReviews")}</p>
                ) : (
                  reviews.slice(0, visibleReviews).map((review) => (
                    <div
                      key={review.id}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <img
                          src={review.user?.avatar_url || userFoto}
                          alt={review.user?.nombre || "Usuario"}
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong style={{ color: "#222", fontSize: "15px" }}>
                                {review.user?.nombre || "Usuario"}
                              </strong>
                              <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                {new Date(review.created_at).toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <Rating value={review.rating} readOnly sx={{ color: "#f896b8" }} size="small" />
                          </div>

                          <p
                            style={{
                              color: "#444",
                              fontSize: "14px",
                              lineHeight: "1.5",
                              margin: "8px 0 6px 0",
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
                <button 
                  onClick={() => setVisibleReviews((prev) => prev + 5)} 
                  style={{ marginTop: "1rem", backgroundColor: "#f896b8", color: "white", padding: "8px 12px", borderRadius: "5px" }}
                >
                  {t("productDetails.viewMore")}
                </button>
              )}

              {visibleReviews > 5 && (
                <button 
                  onClick={() => setVisibleReviews(5)} 
                  style={{ marginTop: "1rem", marginLeft: "10px", backgroundColor: "#ccc", color: "black", padding: "8px 12px", borderRadius: "5px" }}
                >
                  {t("productDetails.viewLess")}
                </button>
              )}
            </>
          )}
        </div>
      )}

    </section>


      {relatedProducts && relatedProducts.length > 0 ?(
        <section className="related-products">
          <h3 style={{ display: "flex", justifySelf: "center" }}>
            {t("productDetails.relatedproducts")}
          </h3>
          <hr
            style={{
              display: "flex",
              justifySelf: "center",
              width: "70%",
              color: "#ccc",
            }}
          ></hr>

          <div className="carousel-container">
            <div className="carousel-items">
              {relatedProducts
                .filter((rp) => rp.subcategoria_id === product.subcategoria_id)
                .slice(0, 4)
                .map((rp) => {
                  const rpPriceOriginal = rp.precio_producto;
                  const rpPriceDiscount = rp.precio_con_mejor_descuento;
                  const rpDiscount = rp.mejor_descuento_para_precio;

                  return (
                    <div
                      className="custom-product-card"
                      key={rp.id}
                      style={{ position: "relative" }}
                    >
                      <IconButton
                        onClick={() => toggleFavorite(rp.id)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "white",
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                        className="custom-favorite-btn"
                      >
                        {favoriteIds.includes(rp.id) ? (
                          <GradientHeart filled />
                        ) : (
                          <GradientHeart filled={false} />
                        )}
                      </IconButton>

                      <Link
                        to={`/${lang}/producto/${rp.slug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="custom-image-wrapper" style={{height: "160px !important"}}>
                          <img
                            src={rp.imagen_url || noImage}
                            alt={rp.nombre_producto}
                            onError={(e) => {
                              e.currentTarget.src = noImage;
                            }}
                          />
                        </div>

                        <div className="custom-product-info">
                          <div className="custom-product-name-v2">
                            {rp.nombre_producto}
                          </div>
                          <div
                            className="custom-price-row-v2"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "30px",
                            }}
                          >
                            <span className="custom-price-v2">
                              {rpPriceDiscount && rpPriceDiscount < rpPriceOriginal ? (
                                <>
                                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                                    {formatCOP(rpPriceDiscount)}
                                  </span>
                                  <span style={{ textDecoration: "line-through", color: "#64748b", marginLeft: "0.7em", fontWeight: "normal" }}>
                                    {formatCOP(rpPriceOriginal)}
                                  </span>
                                </>
                              ) : (
                                formatCOP(rpPriceOriginal)
                              )}
                            </span>
                            <div className="custom-rating-row-v2">
                              <span style={{ flex: 1 }}></span>
                              <span className="custom-star">
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="#FFC107"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{
                                    marginRight: "2px",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="custom-rating-number-v2">
                                  {productRatings[rp.id]?.avg
                                    ? Number(productRatings[rp.id]?.avg).toFixed(1)
                                    : "0.0"}
                                </span>
                              </span>
                            </div>
                          </div>
                          {/* Mostrar porcentaje si aplica */}
                          {rpDiscount && rpDiscount.tipo === "porcentaje" && rpPriceDiscount < rpPriceOriginal && (
                            <div style={{ color: "#2563eb", fontWeight: 500, fontSize: "0.9rem", marginTop: "0.3rem", textAlign: "center" }}>
                              {rpDiscount.valor}% OFF
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="custom-card-footer">
                        <button
                          className="custom-add-btn"
                          onClick={() => addToCart(rp.id)}
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
        <section className="related-products">
          <h3 style={{ display: "flex", justifySelf: "center" }}>
            {t("productDetails.relatedproducts")}
          </h3>
          <hr
            style={{
              display: "flex",
              justifySelf: "center",
              width: "70%",
              color: "#ccc",
            }}
          ></hr>

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
        </section>
      )}



    </div>
  );
}

export default ProductDetails;