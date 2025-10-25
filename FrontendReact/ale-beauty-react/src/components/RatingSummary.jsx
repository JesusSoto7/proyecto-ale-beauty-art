import React from "react";
import { FaStar } from "react-icons/fa";
import "../assets/stylesheets/RatingSummary.css";

function RatingSummary({ ratings, showReviewForm, onOpenReviewForm, onCloseReviewForm, productName }) {
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
        ).toFixed(2);

  const stars = [5, 4, 3, 2, 1];

  return (
    <div className="rating-summary">
      {/* Izquierda: promedio y distribución */}
      <div className="rating-left">
        <div className="rating-header">
          <h3>Calificación general</h3>
        </div>

        <div className="rating-average">
          <h2 style={{ color: "#2d2d2d" }}>{average}</h2>
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                color={i < Math.round(average) ? "#FFD700" : "#a5a5a5"}
                size={24}
              />
            ))}
          </div>
          <p>{totalVotes.toLocaleString()} calificaciones</p>
        </div>

        <div className="rating-distribution">
          {stars.map((star) => {
            const count = ratings[star] || 0;
            const percent = totalVotes ? ((count / totalVotes) * 100).toFixed(0) : 0;

            return (
              <div className="rating-row" key={star}>
                <div className="rating-star-label">
                  {[...Array(star)].map((_, i) => (
                    <FaStar key={i} color="#FFD700" size={12} />
                  ))}
                </div>
                <div className="rating-bar">
                  <div
                    className="rating-bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="rating-percent">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derecha: área para calificar */}
      <div className="rating-right">
        <h4>{productName}</h4>
        <div className="rating-user-stars">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color="#444" size={24} />
          ))}
        </div>
        <p>Haznos conocer tu opinión.</p>
        <button
          className="rating-button"
          onClick={showReviewForm ? onCloseReviewForm : onOpenReviewForm}
        >
          {showReviewForm ? "Cancelar" : "Calificar"}
        </button>

      </div>
    </div>
  );
}

export default RatingSummary;
