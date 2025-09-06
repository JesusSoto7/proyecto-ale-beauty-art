import React, { useState, useEffect } from "react";
import banner1 from "../../assets/images/banner1.jpg";
import banner2 from "../../assets/images/banner2.jpg";
import banner3 from "../../assets/images/banner3.jpg";
import "../../assets/stylesheets/RotatingBanner.css";

export default function RotatingBanner() {
  const banners = [banner1, banner2, banner3];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 2500); // cada 2 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rotating-banner">
      {banners.map((banner, i) => (
        <img
          key={i}
          src={banner}
          alt={`Banner ${i + 1}`}
          className={`banner-image ${i === index ? "active" : ""}`}
        />
      ))}
    </div>
  );
}

