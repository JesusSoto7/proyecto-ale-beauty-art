import React from "react";
import Rating from "@mui/material/Rating";
import "../assets/stylesheets/positiveReviews.css";

function PositiveReviews({ reviews = [] }) {
  const positiveReviews = reviews.filter((r) => r.rating >= 4);

  return (
    <div className="reviews-row-wrapper">
      <div className="reviews-row">
        {[...positiveReviews, ...positiveReviews].map((review, index) => (
          <div key={index} className="review-card">
            <div className="review-header">
              <img
                src={
                  review.user?.avatar_url ||
                  "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png"
                }
                alt={review.user?.nombre}
                className="review-avatar"
              />
              <div className="review-info">
                <h4>{review.user?.nombre}</h4>
                <div className="review-rating">
                  <span>{review.rating.toFixed(1)}</span>
                  <Rating
                    value={review.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </div>
              </div>
              <div className="review-quote">“</div>
            </div>
            <p className="review-text">{review.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PositiveReviews;
