import React, { useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import { Link, useParams } from "react-router-dom";
import "../assets/stylesheets/BannerProducts.css";

function BannerProduct({ products, productRatings }) {
  const { lang } = useParams();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Espera a que las imágenes se carguen
  useEffect(() => {
    if (products && products.length > 0) {
      const images = products.map((p) => {
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

  // Cambia de producto cada 10 segundos
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
      <div className="bannerProducts-loading">
        <div class="loader"></div> 
      </div>
    );
  }

  const product = products[index];
  const ratingValue = productRatings?.[product.id]?.avg || 0;

  return (
    <div className="banner">
      {/* Contenido texto */}
      <div className="content banner-info">
        <h1>{product.nombre_producto || "no_name"}</h1>
        <h2>{product.sub_category?.category?.nombre_categoria || ""}</h2>
        <div id="desc" style={{minHeight: "130px", height: "fit-content", maxHeight: "140px", overflow: "hidden", marginBottom: "20px"}}>
          <p className="banner-description">{product.descripcion}</p>
        </div>
        

        <section className="section-DataBanner" style={{    display: "flex", flexDirection: "row-reverse", justifyContent: "flex-end", gap: 20}}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexDirection: "row" }}>
            <Rating
              name={`product-rating-${product.id}`}
              value={ratingValue}
              precision={0.5}
              readOnly
              size="large"
              sx={{ color: "#fff" }}
            />
            <h5 style={{ marginBottom: 2, color: "#fff" }}>({ratingValue})</h5>
          </div>

          <Link
            to={`/${lang}/producto/${product.slug || product.id}`}
            style={{ textDecoration: "none", color: "inherit", width: 200 }}
          >
            <button className="btn-banner">Ver detalles</button>
          </Link>
        </section>
      </div>

      {/* Imagen a la derecha */}
      <div className="image-area">
        <img
          src={product.imagen_url}
          alt={product.nombre_producto || product.name || "Producto"}
          className="circle-image"
        />
      </div>
      
    </div>
    
  );
}

export default BannerProduct;
