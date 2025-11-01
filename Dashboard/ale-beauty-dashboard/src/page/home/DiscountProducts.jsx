import React, { useEffect, useState } from 'react';

export default function ApplyDiscount() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://localhost:4000/api/v1/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div>
      <h2>Productos con Descuento</h2>
      {products.map(product => (
        <div key={product.id} style={{border: '1px solid #ccc', margin: '1em', padding: '1em'}}>
          <h3>{product.nombre_producto}</h3>
          <p>Precio original: ${product.precio_producto}</p>
          {product.discount && product.discount.activo ? (
            <div>
              <strong>Descuento:</strong>{" "}
              {product.discount.tipo === 'porcentaje'
                ? `${product.discount.valor}%`
                : `$${product.discount.valor}`}
              <br />
              <span>Promo: {product.discount.nombre}</span>
              {/* Puedes mostrar la fecha de la promoción si quieres */}
              <br />
              <span>
                Vigente: {product.discount.fecha_inicio} a {product.discount.fecha_fin}
              </span>
            </div>
          ) : (
            <span>Sin descuento</span>
          )}
        </div>
      ))}
    </div>
  );
}