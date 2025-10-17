import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import { Link, useParams } from "react-router-dom";

function BannerProduct({ products, productRatings }) {
  const { lang } = useParams();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Espera a que las imágenes se carguen
  useEffect(() => {
    if (products && products.length > 0) {
      const images = products.map(p => {
        const img = new Image();
        img.src = p.imagen_url;
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      Promise.all(images).then(() => setLoading(false));
    }
  }, [products]);

  // Cambia de producto cada 5 segundos
  useEffect(() => {
    if (!products || products.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#df6897",
          borderRadius: "10px",
          color: "white",
          fontSize: "1.5rem",
        }}
      >
        Cargando productos...
      </div>
    );
  }

  const product = products[index];
  const ratingValue = productRatings?.[product.id]?.avg || 0;

  return (
    <div
      style={{
        backgroundColor: "#df6897",
        width: "90%",
        height: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        borderRadius: "10px",
        overflow: "hidden",
        margin: "auto",
        position: "relative",
        border: "solid 1px #ffd8e4ff",
        transition: "all 1s ease-in-out",
      }}
    >
      {/* Imagen */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          width: "35%",
          height: "120%",
          borderRadius: "60%",
          boxShadow: "0px 1px 65px 0px rgba(173, 58, 129, 0.88)",
          transition: "all 1s ease-in-out",
        }}
      >
        <img
          src={product.imagen_url}
          alt={product.nombre_producto || product.name || "Producto"}
          style={{
            width: "70%",
            height: "400px",
            objectFit: "contain",
            borderRadius: 100,
            transition: "opacity 1s ease-in-out",
          }}
        />
      </div>

      {/* Información */}
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          justifyContent: "space-around",
          transition: "all 1s ease-in-out",
        }}
      >
        <h1 style={{ color: "#fff", fontSize: 60 }}>
          {product.nombre_producto || product.name}
        </h1>

        <p style={{ color: "#fff" }}>{product.descripcion}</p>

        <section style={{display: "flex", gap: 10, justifyContent: "end"}}>
          <div style={{display: "flex", gap: 10, alignItems: "center"}}>
            <Rating
              name={`product-rating-${product.id}`}
              value={ratingValue}
              precision={0.5}
              readOnly
              size="large"
              sx={{ color: "#ffc107" }}
            />
            <h5 style={{marginBottom: 2, color: "#fff" }}>({ratingValue})</h5> 
          </div>
          

          <Link
            to={`/${lang}/producto/${product.slug || product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <button
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#fff",
                color: "#df6897",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              Ver detalles
            </button>
          </Link>
        </section>
        
      </div>
    </div>
  );
}

export default BannerProduct;
