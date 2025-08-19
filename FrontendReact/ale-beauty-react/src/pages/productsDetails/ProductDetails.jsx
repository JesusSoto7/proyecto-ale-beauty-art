import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`https://localhost:4000/api/v1/products/${slug}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err));
  }, [slug]);

  if (!product) return <p>Cargando producto...</p>;

  return (
    <div className="product-details-page">
      <h2>{product.nombre_producto}</h2>
      <img
        src={product.imagen_url || "https://via.placeholder.com/400x300?text=Sin+imagen"}
        alt={product.nombre_producto}
      />
      <p>{product.descripcion}</p>
      <p>Precio: ${product.precio_producto}</p>
      <p>Categoría: {product.categoria_nombre}</p>
      <p>Stock: {product.stock}</p>
    </div>
  );
}

export default ProductDetails;
