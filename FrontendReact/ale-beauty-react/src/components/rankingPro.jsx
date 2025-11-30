import React from "react";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { Link, useParams } from "react-router-dom";
import "../assets/stylesheets/RankingPro.css";

function RankingPro({ products, productRatings, loading }) {
  const { lang } = useParams();

  // Productos con rating ordenados
  const ratedProducts = products && productRatings
    ? products
      .filter((p) => productRatings[p.id])
      .map((p) => ({
        ...p,
        rating: productRatings[p.id].avg,
        count: productRatings[p.id].count,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
    : [];

  // Siempre muestra cards, ajustando el contenido si está cargando
  const cardsToShow = [0, 1, 2].map((i) => ratedProducts[i] || {});

  // Sizing for skeleton from CSS variable (como en el card)
  const getImageSkeletonHeight = () => {
    // Reemplaza por una aproximación adecuada si no accedes a getComputedStyle
    // Aquí, el valor por defecto como en CSS (--rk-image-max-h)
    return 'clamp(180px, 22vw, 300px)';
  };

  return (
    <section className="ranking-container">
      {cardsToShow.map((product, index) => (
        <Link
          key={product.id || index}
          to={product.id ? `/${lang}/producto/${product.slug || product.id}` : "#"}
          style={{ textDecoration: "none", color: "inherit", pointerEvents: product.id ? "auto" : "none" }}
        >
          <div className="ranking-card">
            <div
              className="ranking-image"
              style={{ minHeight: "var(--rk-image-max-h)", maxHeight: "var(--rk-image-max-h)" }}
            >
              {loading || !product.imagen_url ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  animation="wave"
                  sx={{
                    bgcolor: "#e0e0e0",
                    minHeight: "var(--rk-image-max-h)",
                    maxHeight: "var(--rk-image-max-h)",
                    width: "100%",
                    display: "block",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <img
                  src={product.imagen_url}
                  alt={product.nombre_producto || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center"
                  }}
                />
              )}
            </div>
            <div className="ranking-info">
              <h2 className="ranking-title">
                {loading ? (
                  <Skeleton variant="text" width="90%" height={30} animation="wave" />
                ) : (
                  product.nombre_producto
                )}
              </h2>
              <div className="ranking-labels">
                {loading ? (
                  <>
                    <Skeleton variant="rectangular" width={64} height={24} sx={{ borderRadius: "16px" }} animation="wave" />
                    <Skeleton variant="rectangular" width={76} height={22} animation="wave" />
                  </>
                ) : (
                  <>
                    <span className={`label ${product.stock > 1 ? "in-stock" : "out-stock"}`}>
                      {product.stock > 1 ? "En stock" : "Agotado"}
                    </span>
                    <div className="ranking-rating">
                      <Rating
                        value={product.rating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <span className="rating-count">({product.count || 0})</span>
                    </div>
                  </>
                )}
              </div>
              <p className="ranking-comments" style={{ minHeight: 18 }}>
                {loading
                  ? <Skeleton variant="text" width="60%" height={18} animation="wave" />
                  : (product.count > 0
                    ? `${product.count} comentarios`
                    : "Sin comentarios")}
              </p>
            </div>
            <div className="ranking-top-badge">Top {index + 1}</div>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default RankingPro;