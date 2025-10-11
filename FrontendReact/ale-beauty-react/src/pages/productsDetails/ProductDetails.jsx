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

function ProductDetails() {
  const { slug } = useParams();
  const { lang } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [token] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  const isFavorite = product ? favoriteIds.includes(product.id) : false;
  const [reviews, setReviews] = useState([]);
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
            // console.log("Todos los productos:", allProducts);
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

    useEffect(() => {        // <-- ERROR: Hook dentro de hook
      if (!product) return;
      window.gtag && window.gtag('event', 'view_item', {
        items: [{
          item_id: product.id,
          item_name: product.nombre_producto,
          price: product.precio_producto,
          item_category: product.sub_category?.category?.nombre_categoria,
          item_variant: product.sku || '', // si tienes variante
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

        // Construir conteo por estrellas
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
        setFormData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.email || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
        });
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
            color: "#f896b8", // color rosa
          }}
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          ({Number(value).toFixed(1)}) ({count})
        </Typography>
      </Box>
    );
  }

  function ProductDescription({ description }) {
    const limit = 150; // número de caracteres a mostrar

    if (!description) return null; // evita error si es null o undefined

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


  // --- funciones de acciones ---
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
        // ✅ refrescamos las reseñas después de guardar
        setReviews((prev) => [...prev, data]);
        setNewReview({ rating: 0, comentario: "" }); // limpiamos formulario
      } else {
        alert("Error al enviar reseña: " + (data.errors || "desconocido"));
      }
    } catch (err) {
      console.error("Error enviando reseña:", err);
      alert("No se pudo enviar la reseña");
    }
  };


  // toggle favoritos
  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        // quitar favorito
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites(); // refresca favoritos globales
        }
      } else {
        // añadir favorito
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
          await loadFavorites(); // refresca favoritos globales
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };


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
          {/* componente de rating */}
           <ProductRating value={averageRating} count={reviews.length} />

          {/* <ProductRating value={product.promedio_rating} count={product.total_reviews} /> */}

          <br></br>
          <p className="price"> {formatCOP(product.precio_producto)}</p>

          {/* botones de acción */}
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
      {/* Descripción */}
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

      {/* Contenido dinámico */}
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
                        {/* Imagen de usuario */}
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
                          {/* Encabezado: nombre + fecha + estrellas */}
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

                          {/* Comentario */}
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


      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <h3 style={{display: "flex", justifySelf: "center"}}>{t("productDetails.relatedproducts")}</h3>
          <hr style={{display: "flex", justifySelf: "center", width: "70%", color: "#ccc"}}></hr>
          <div className="carousel-container">
            <div className="carousel-items">
              {relatedProducts.map((rp) => (
                <div className="product-card" key={rp.id} style={{ position: "relative" }}>
                  
                  {/* Botón de favorito */}
                  <IconButton
                    onClick={() => toggleFavorite(rp.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    {favoriteIds.includes(rp.id) ? (
                      <Favorite sx={{ color: "#ffffffff" }} />
                    ) : (
                      <FavoriteBorder />
                    )}

                  </IconButton>

                  {/* Enlace al producto */}
                  <Link
                    to={`/${lang}/producto/${rp.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="image-container">
                      <img
                        src={rp.imagen_url || noImage}
                        alt={rp.nombre_producto}
                        onError={(e) => {
                          e.currentTarget.src = noImage;
                        }}
                      />
                    </div>
                    <h5>{rp.nombre_producto}</h5>
                    <p>{formatCOP(rp.precio_producto)}</p>
                  </Link>

                  {/* Botón de agregar al carrito */}
                  <div className="actions">
                    <button onClick={() => addToCart(rp.id)}>
                      {t('home.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="related-products">
          <h3 style={{display: "flex", justifySelf: "center"}}>{t("productDetails.relatedproducts")}</h3>
          <hr style={{display: "flex", justifySelf: "center", width: "70%", color: "#ccc"}}></hr>
          {/* Skeletons mientras carga */}
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4, 5].map((skeleton) => (
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