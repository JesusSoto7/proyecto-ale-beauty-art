import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('https://localhost:4000/api/v1/inicio') // tu endpoint de Rails
      .then(res => res.json())
      .then(data => {
        setCarousel(data.admin_carousel || []);
        setProducts(data.products || []);
        setCategories(data.categories || []);
      });
  }, []);

  return (
    <div>
      {carousel.length > 0 ? (
        <Carousel>
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`Slide ${idx + 1}`}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No hay imágenes de carrusel disponibles.</p>
      )}


      {/* Productos */}
      <section>
        <h2>Novedades Maquillaje</h2>
        {products.length > 0 ? (
          products.map(prod => (
            <div key={prod.id}>
              <img src={prod.imagen_url} alt={prod.nombre_producto} />
              <h3>{prod.nombre_producto}</h3>
              <p>${prod.precio_producto}</p>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </section>

      {/* Categorías */}
      <section>
        <h2>Categorías</h2>
        {categories.length > 0 ? (
          categories.map(cat => (
            <div key={cat.id}>
              <img src={cat.imagen_url} alt={cat.nombre_categoria} />
              <h5>{cat.nombre_categoria}</h5>
            </div>
          ))
        ) : (
          <p>No hay categorías disponibles.</p>
        )}
      </section>
    </div>
  );
}

export default Inicio;
