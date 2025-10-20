import React, { useState, useEffect } from "react";
import banner1 from "../../src/assets/images/static_1.jpg";
import banner2 from "../../src/assets/images/static_2.jpg";
import banner3 from "../../src/assets/images/static_3.jpg";
import "../../src/assets/stylesheets/staticBanner.css";

const images = [
  banner1,
  banner2,
  banner3,
];

function StaticBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cambio automático cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goToPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToIndex = (index) => setCurrentIndex(index);

  return (
    <div className="banner-container">
      <div className="banner-slider">
        {images.map((img, index) => (
          <div
            key={index}
            className={`banner-slide ${
              index === currentIndex ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${img})` }}
          ></div>
        ))}
      </div>

      {/* Botones de control */}
      <button className="banner-btn prev" onClick={goToPrev}>
        &#10094;
      </button>
      <button className="banner-btn next" onClick={goToNext}>
        &#10095;
      </button>

      {/* Indicadores */}
      <div className="banner-indicators">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => goToIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default StaticBanner;
