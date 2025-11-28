import React from "react";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { Link, useParams } from "react-router-dom";
import "../assets/stylesheets/RankingPro.css";

function RankingPro({ products, productRatings, loading }) {
  const { lang } = useParams();

  // Si aún no hay datos y está cargando, mostrar skeletons
  if (loading) {
    return (
      <section className="ranking-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ranking-card">
            <div className="ranking-image">
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
                sx={{ bgcolor: "#e0e0e0" }}
              />
            </div>

            <div className="ranking-info">
              {/* Título */}
              <Skeleton
                variant="text"
                width="100%"
                height={30}
                sx={{ marginBottom: "0.5rem" }}
              />
              {/* Subtítulo */}
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ marginBottom: "1.5rem" }}
              />

              {/* Fila inferior: Botón y Círculo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "auto",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={36}
                  sx={{ borderRadius: "4px" }}
                />
                <Skeleton variant="circular" width={36} height={36} />
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Si ya hay productos con rating
  if (!products || products.length === 0 || !productRatings) return null;

  const ratedProducts = products
    .filter((p) => productRatings[p.id])
    .map((p) => ({
      ...p,
      rating: productRatings[p.id].avg,
      count: productRatings[p.id].count,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <section className="ranking-container">
      {ratedProducts.map((product, index) => (
        <Link
          key={product.id}
          to={`/${lang}/producto/${product.slug || product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="ranking-card">
            <div className="ranking-image">
              <img src={product.imagen_url} alt={product.nombre} />
            </div>
            <hr style={{ color: "#ccc" }} />

            <div className="ranking-info">
              <h2 className="ranking-title">{product.nombre_producto}</h2>

              <div className="ranking-labels">
                <span
                  className={`label ${product.stock > 1 ? "in-stock" : "out-stock"
                    }`}
                >
                  {product.stock > 1 ? "En stock" : "Agotado"}
                </span>
                <div className="ranking-rating">
                  <Rating
                    value={product.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <span className="rating-count">({product.count})</span>
                </div>
              </div>

              <p className="ranking-comments">
                {product.count > 0
                  ? `${product.count} comentarios`
                  : "Sin comentarios"}
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
