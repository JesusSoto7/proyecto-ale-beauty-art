import React from "react";
import { FaStar } from "react-icons/fa";
import "../assets/stylesheets/RatingSummary.css";

function RatingSummary({ ratings }) {
  // Calcular promedio
  const totalVotes = Object.values(ratings).reduce((a, b) => a + b, 0);
  const average =
    totalVotes === 0
      ? 0
      : (
          (5 * ratings[5] +
            4 * ratings[4] +
            3 * ratings[3] +
            2 * ratings[2] +
            1 * ratings[1]) /
          totalVotes
        ).toFixed(1);

  // Para iterar de 5 a 1 estrellas
  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="rating-summary">
      {/* Izquierda: distribución */}
      <div className="rating-distribution">
        {stars.map((star) => {
          const count = ratings[star] || 0;
          const percent = totalVotes ? (count / totalVotes) * 100 : 0;

          return (
            <div className="rating-row" key={star}>
              <span className="rating-label">{star}</span>
              <FaStar className="rating-icon" />
              <div className="rating-bar">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="rating-count">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Derecha: promedio */}
      <div className="rating-average">
        <h2>{average}</h2>
        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              color={i < Math.round(average) ? "#FFD700" : "#ddd"}
              size={22}
            />
          ))}
        </div>
        <p>{totalVotes} Ratings</p>
      </div>
    </div>
  );
}

export default RatingSummary;
