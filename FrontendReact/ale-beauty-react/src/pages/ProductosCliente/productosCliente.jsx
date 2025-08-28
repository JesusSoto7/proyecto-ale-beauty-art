import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { lang } = useParams();

  // Obtener token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  // Cargar productos, carrito y favoritos
  useEffect(() => {
    if (!token) return;

    // Productos
    fetch("https://localhost:4000/api/v1/products", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(data || []))
      .catch(err => console.error("Error cargando productos:", err));

    // Carrito
    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error('Error cargando carrito:', err));

    // Favoritos
    fetch('https://localhost:4000/api/v1/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map(fav => fav.product_id || fav.id);
        setFavoriteIds(ids);
      })
      .catch(err => console.error('Error cargando favoritos:', err));
  }, [token]);

  // Añadir al carrito
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
          console.warn('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto al carrito: ', err);
      });
  };

  // Añadir / quitar de favoritos
  const toggleFavorite = async (productId) => {
    if (favoriteIds.includes(productId)) {
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

  if (!token) return <p>No autenticado</p>;
  if (products.length === 0) return <p>No hay productos disponibles.</p>;

  return (
    <section className="mt-5">
      <h2 className="mb-4">Todos los productos</h2>
      <div className="productos-grid">
        {products.map((prod) => (
          <div className="product-card" key={prod.id} style={{ position: "relative" }}>
            {/* Botón de favoritos */}
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
                <Favorite sx={{ color: "#ffffffff" }} />
              ) : (
                <FavoriteBorder sx={{ color: "#ffffffff" }} />
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
    </section>
  );
}

export default ProductosCliente;
