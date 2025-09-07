import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";
import noImage from "../../assets/images/no_image.png";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { lang } = useParams();
  const { t } = useTranslation();

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
      .catch(err => console.error(t('products.loadError'), err));

    // Carrito
    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error(t('products.cartError'), err));

    // Favoritos
    fetch('https://localhost:4000/api/v1/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map(fav => fav.product_id || fav.id);
        setFavoriteIds(ids);
      })
      .catch(err => console.error(t('products.favoritesError'), err));
  }, [token, t]);

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
          alert(t('products.addedToCart'));
        } else if (data.errors) {
          console.warn(t('products.error') + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error(t('products.cartAddError'), err);
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
        console.error(t('products.removeFavoriteError'), err);
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
        console.error(t('products.addFavoriteError'), err);
      }
    }
  };

  if (!token) return <p>{t('products.notAuthenticated')}</p>;
  if (products.length === 0) return <p>{t('products.noProducts')}</p>;

  return (
    <section className="mt-5">
      <h2 className="mb-4">{t('products.allProducts')}</h2>
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
                <img
                  src={prod.imagen_url || noImage}
                  alt={prod.nombre_producto}
                  onError={(e) => { e.currentTarget.src = noImage; }}
                />
              </div>
              <h5>{prod.nombre_producto}</h5>
              <p>{formatCOP(prod.precio_producto)}</p>
            </Link>

            <div className="actions">
              <button onClick={() => addToCart(prod.id)}>
                {t('products.addToCart')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductosCliente;