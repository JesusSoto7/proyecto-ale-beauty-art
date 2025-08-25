import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Link, useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('https://localhost:4000/api/v1/inicio')
      .then(res => res.json())
      .then(data => {
        const imgs = [
          ...(data.admin_carousel || []),
          ...(data.products?.map(p => p.imagen_url) || [])
        ];

        // Esperar a que todas las imágenes se carguen
        let loadedCount = 0;
        if (imgs.length === 0) {
          setCarousel(data.admin_carousel || []);
          setProducts(data.products || []);
          setCategories(data.categories || []);
          setLoading(false);
          return;
        }

        imgs.forEach(src => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === imgs.length) {
              setCarousel(data.admin_carousel || []);
              setProducts(data.products || []);
              setCategories(data.categories || []);
              setLoading(false);
            }
          };
        });
      })
      .catch(err => {
        console.error('Error cargando datos: ' + err);
        setLoading(false);
      });

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
      {loading ? (
        <Skeleton
          sx={{ bgcolor: 'grey.800' }}
          variant="rectangular"
          width={"100%"}
          height={350}
        />
      ) : carousel.length > 0 ? (
        <Carousel interval={3000} className="mb-0">
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`Slide ${idx + 1}`}
                style={{
                  height: "400px",
                  objectFit: "cover",
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : null}

      {/* Productos */}
      <section className="mt-5">
        <h2 className="mb-4">Novedades Maquillaje</h2>
        {loading ? (
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4].map((skeleton) => (
                <div className="product-card" key={skeleton}>
                  <div className="image-container">
                    <Skeleton variant="rectangular" width={"100%"} height={200} />
                  </div>
                  <Skeleton variant="text" width={150} height={30} />
                  <Skeleton variant="text" width={80} height={20} />
                  <div className="actions">
                    <Skeleton variant="rectangular" width={120} height={36} />
                    <Skeleton variant="circular" width={36} height={36} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
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
                    to={`/${lang}/producto/${prod.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="image-container">
                      <img
                        src={prod.imagen_url}
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
    </div>
  );
}

export default Inicio;
