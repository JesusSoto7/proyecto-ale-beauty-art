import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Link } from 'react-router-dom';


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

  const addToFavorites = (productId) => {
    fetch('https://localhost:4000/api/v1/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Producto añadido a favoritos');
        } else if (data.errors) {
          alert('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto a favoritos: ', err);
        alert('Error añadiendo producto a favoritos');
      });
  };


  return (
    <div>
      {carousel.length > 0 ? (
        <Carousel interval={3000} className="mb-0">
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`Slide ${idx + 1}`}
                style={{
                  height: "400px", // más alto como banner
                  objectFit: "cover",
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No hay imágenes de carrusel disponibles.</p>
      )}


      {/* Productos */}
      {/* Productos */}
      <section className="mt-5">
        <h2 className="mb-4">Novedades Maquillaje</h2>
        {products.length > 0 ? (
          <div className="carousel-container">
            {/* Botón izquierdo */}
            <button
              className="carousel-btn prev"
              onClick={() => {
                document.querySelector(".carousel-items").scrollBy({ left: -300, behavior: "smooth" });
              }}
            >
              ❮
            </button>

            {/* Productos en fila */}
            <div className="carousel-items">
              {products.map(prod => (
                <div className="product-card" key={prod.id}>
                  <Link
                    to={`/products/${prod.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="image-container">
                      <img
                        src={prod.imagen_url || "https://via.placeholder.com/250x200?text=Sin+imagen"}
                        alt={prod.nombre_producto}
                      />
                    </div>
                    <h5>{prod.nombre_producto}</h5>
                    <p>${prod.precio_producto}</p>
                  </Link>
                  <div className="actions">
                    <button onClick={() => addToCart(prod.id)}>Añadir al carrito</button>
                    <IconButton onClick={() => addToFavorites(prod.id)}>
                      <FavoriteBorder />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón derecho */}
            <button
              className="carousel-btn next"
              onClick={() => {
                document.querySelector(".carousel-items").scrollBy({ left: 300, behavior: "smooth" });
              }}
            >
              ❯
            </button>
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
