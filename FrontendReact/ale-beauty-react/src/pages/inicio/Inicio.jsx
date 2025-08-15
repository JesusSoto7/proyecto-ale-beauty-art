import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('https://localhost:4000/api/v1/inicio')
      .then(res => res.json())
      .then(data => {
        setCarousel(data.admin_carousel || []);
        setProducts(data.products || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error('Error cargando datos: '.err));

    fetch('https://localhost:4000/api/v1/cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error('Error cargando carrito:', err));
  }, [token]);

  const addToCart = (productId) => {
    fetch('https://localhost:4000/api/v1/cart/add_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) {
          setCart(data.cart);
          alert('Producto añadido al carrito');
        } else if (data.errors) {
          alert('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto al carrito: ', err);
        alert('Error añadiendo producto al carrito');
      });
  };

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
      <section className="mt-5">
        <h2 className="mb-4">Novedades Maquillaje</h2>
        {products.length > 0 ? (
          <div className="row g-4">
            {products.map(prod => (
              <div className="col-md-4 col-lg-3" key={prod.id}>
                <div className="card h-100 shadow-sm">
                  <img
                    src={prod.imagen_url}
                    alt={prod.nombre_producto}
                    className="card-img-top"
                    style={{
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{prod.nombre_producto}</h5>
                    <p className="card-text text-primary fw-bold">
                      ${prod.precio_producto}
                    </p>
                    <button onClick={() => addToCart(prod.id)}>Añadir al carrito</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </section>

      {/* Categorías */}
      {/* <section>
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
      </section> */}
    </div>
  );
}

export default Inicio;
