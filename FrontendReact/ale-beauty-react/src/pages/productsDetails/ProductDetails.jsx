import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import "../../assets/stylesheets/ProductDetails.css";
import { formatCOP } from "../../services/currency";
import { BsCart4 } from "react-icons/bs";
import Skeleton from "@mui/joy/Skeleton";
import noImage from "../../assets/images/no_image.png";
import { useOutletContext } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";


function ProductDetails() {
  const { slug } = useParams();
  const { lang } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [token] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);


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
              .filter((p) => p.category_id === data.category_id && p.id !== data.id)
              .slice(0, 5);
              // console.log(allProducts[0])
            // console.log("Relacionados filtrados:", filtered);
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
  }, [product, slug, token]);

  

  function ProductImage({ product, noImage }) {
    return (
      <div className="product-image" style={{ position: "relative" }}>
        {!imgLoaded && (
          <Skeleton
            variant="rectangular"
            width={"400px"}
            height={400}
            sx={{ position: "absolute", top: 0, left: 100 }}
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
          alert(t('productDetails.addedToCart'));
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


  // ✅ toggle favoritos
  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        // ❌ quitar favorito
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      } else {
        // ❤️ añadir favorito
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
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };


  return (
    <div className="product-details-page">
      <div className="product-container">
        <ProductImage product={product} noImage={noImage} />

        <div className="product-info">
          <div className="title-category">
            <p className="negrita">{product.category.nombre_categoria}</p>
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
            <button onClick={() => addToCart(product.id)}>
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
      <div className="description-section">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          borderBottom: '1px solid #eee', 
          marginBottom: '1rem' 
        }}>
          <button style={activeBtnStyle}>{t("productDetails.description")}</button>
        </div>
        <p style={{ color: '#3d3d3dff', overflowWrap: "anywhere" }}>
          {product.descripcion}
        </p>
      </div>


    <div className="reviews-section">
      <h3>{t("productDetails.reviews")}</h3>

      {loadingReviews ? (
        // Un único spinner para todo
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <CircularProgress sx={{ color: "#f896b8" }} />
        </div>
      ) : (
        <>
          {canReview ? (
            <form onSubmit={handleSubmitReview} style={{ marginBottom: "1.5rem" }}>
              <Rating
                name="new-rating"
                value={newReview.rating}
                onChange={(e, value) =>
                  setNewReview({ ...newReview, rating: value })
                }
                sx={{ color: "#f896b8" }}
              />
              <textarea
                placeholder={t("productDetails.writeReview")}
                value={newReview.comentario}
                onChange={(e) =>
                  setNewReview({ ...newReview, comentario: e.target.value })
                }
                rows={3}
                style={{ width: "100%", marginTop: "0.5rem" }}
              />
              <button type="submit" style={{ marginTop: "0.5rem" }}>
                {t("productDetails.submitReview")}
              </button>
            </form>
          ) : (
            <p style={{ color: "gray" }}>
              {t("productDetails.onlyClients")}
            </p>
          )}

          <div>
            {reviews.length === 0 ? (
              <p>{t("productDetails.noReviews")}</p>
            ) : (
              reviews.slice(0, visibleReviews).map((review) => (
                <div
                  key={review.id}
                  style={{ borderBottom: "1px solid #eee", marginBottom: "1rem" }}
                >
                  <Rating value={review.rating} readOnly sx={{ color: "#f896b8" }} />
                  <p>{review.comentario}</p>
                  <small>
                    Por {review.user?.nombre || "Usuario"} -{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
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