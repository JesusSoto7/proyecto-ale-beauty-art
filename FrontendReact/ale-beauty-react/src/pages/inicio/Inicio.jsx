import React, { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import { Link, useParams } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { formatCOP } from '../../services/currency';
import bannerInicio from '../../assets/images/bannerInicio.jpg'
import { useOutletContext } from "react-router-dom";

function Inicio() {
  const [carousel, setCarousel] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();
  const [loading, setLoading] = useState(true);
  // const [favoriteIds, setFavoriteIds] = useState([]); // ✅ lista de favoritos
  const { favoriteIds, loadFavorites } = useOutletContext();
  
  const token = localStorage.getItem('token');

  // 📌 Cargar productos + favoritos del usuario
  useEffect(() => {
    // Productos e inicio
    fetch('https://localhost:4000/api/v1/inicio')
      .then(res => res.json())
      .then(data => {
        const imgs = [
          ...(data.admin_carousel || []),
          ...(data.products?.map(p => p.imagen_url) || [])
        ];

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

    // Carrito
    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error('Error cargando carrito:', err));

    // Favoritos del usuario
    fetch('https://localhost:4000/api/v1/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map(fav => fav.id); // el backend devuelve { id, nombre_producto... }
        setFavoriteIds(ids);
      })
      .catch(err => console.error('Error cargando favoritos:', err));
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

  // 📌 Toggle favoritos
  const toggleFavorite = async (productId) => {
    if (favoriteIds.includes(productId)) {
      // ❌ quitar favorito
      try {
        const res = await fetch(`https://localhost:4000/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setFavoriteIds(prev => prev.filter(id => id !== productId));
        }
      } catch (err) {
        console.error("Error quitando favorito:", err);
      }
    } else {
      // ❤️ añadir favorito
      try {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          setFavoriteIds(prev => [...prev, productId]);
        }
      } catch (err) {
        console.error("Error añadiendo favorito:", err);
      }
    }
  };

  return (
    <div>
      {loading ? (
        <Skeleton sx={{ bgcolor: 'grey.800' }} variant="rectangular" width={"100%"} height={350} />
      ) : carousel.length > 0 ? (
        <Carousel interval={3000} className="mb-0">
          {carousel.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`Slide ${idx + 1}`}
                style={{ height: "400px", objectFit: "cover" }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : null}


{/* 🔹 Sección Novedades Maquillaje */}
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
          document.querySelector(".carousel-items")
            .scrollBy({ left: -300, behavior: "smooth" });
        }}
      >
        ❮
      </button>

      {/* Productos */}
      <div className="carousel-items">
        {products.map((prod) => (
          <div className="product-card" key={prod.id} style={{ position: "relative" }}>
            <IconButton
              onClick={() => toggleFavorite(prod.id)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "white",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              {favoriteIds.includes(prod.id) ? (
                <Favorite sx={{ color: "white" }} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>

            <Link
              to={`/${lang}/producto/${prod.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="image-container">
                <img src={prod.imagen_url} alt={prod.nombre_producto} />
              </div>
              <h5>{prod.nombre_producto}</h5>
              <p>{formatCOP(prod.precio_producto)}</p>
            </Link>

            <div className="actions">
              <button onClick={() => addToCart(prod.id)}>Añadir al carrito</button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón derecho */}
      <button
        className="carousel-btn next"
        onClick={() => {
          document.querySelector(".carousel-items")
            .scrollBy({ left: 300, behavior: "smooth" });
        }}
      >
        ❯
      </button>
    </div>
  ) : (
    <p>No hay productos disponibles.</p>
  )}
</section>

{/* 🔹 Banner (ahora debajo de novedades) */}
<div style={{ margin: "40px 0" }}>
  <img
    src={bannerInicio} 
    alt="Banner Novedades"
    style={{
      width: "100%",
      height: "350px",   // 🔹 altura fija
      objectFit: "cover" // 🔹 mantiene proporción
    }}
  />
</div>


{/* 🔹 Sección Quizás te puedan interesar */}
<section className="mt-5">
  <h2 className="mb-4">Quizás te puedan interesar:</h2>
  {!loading && products.length > 0 ? (
    <div className="carousel-container">
      <div className="carousel-items">
        {products.slice(0, 6).map((prod) => (
          <div className="product-card" key={prod.id} style={{ position: "relative" }}>
            <IconButton
              onClick={() => toggleFavorite(prod.id)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "white",
                "&:hover": { bgcolor: "grey.200" },
              }}
            >
              {favoriteIds.includes(prod.id) ? (
                <Favorite sx={{ color: "red" }} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>

            <Link
              to={`/${lang}/producto/${prod.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="image-container">
                <img src={prod.imagen_url} alt={prod.nombre_producto} />
              </div>
              <h5>{prod.nombre_producto}</h5>
              <p>{formatCOP(prod.precio_producto)}</p>
            </Link>

            <div className="actions">
              <button onClick={() => addToCart(prod.id)}>Añadir al carrito</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null}
</section>

    </div>
  );
}

export default Inicio;
