import React from "react";
import Rating from "@mui/material/Rating";
import "../assets/stylesheets/RankingPro.css";

function RankingPro({ products, productRatings }) {
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
        
        <div key={product.id} className="ranking-card">
          <div className="ranking-image">
            <img src={product.imagen_url} alt={product.nombre} />
          </div>
          <hr style={{color: "#ccc"}} />
          

          <div className="ranking-info">
            <h2 className="ranking-title">{product.nombre_producto}</h2>

            <div className="ranking-labels">
              <span className="label in-stock">en stock</span>
              <div className="ranking-rating">
                <Rating
                  value={product.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <span className="rating-count">
                  ({product.count})
                </span>
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
      ))}
    </section>
  );
}

export default RankingPro;
