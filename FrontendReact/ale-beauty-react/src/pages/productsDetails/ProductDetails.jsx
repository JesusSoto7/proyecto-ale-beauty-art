import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import "../../assets/stylesheets/ProductDetails.css";
import { formatCOP } from "../../services/currency";

function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [token] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  // Cargar producto + carrito + favoritos
  useEffect(() => {
    if (!token) {
      alert(t('productDetails.notAuthenticated'));
      return;
    }

    // cargar producto
    fetch(`https://localhost:4000/api/v1/products/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        // 🔍 verificar si este producto está en favoritos
        fetch("https://localhost:4000/api/v1/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((favorites) => {
            const isFav = favorites.some((fav) => fav.id === data.id);
            setIsFavorite(isFav);
          })
          .catch((err) =>
            console.error(t('productDetails.favoritesError'), err)
          );
      })
      .catch((err) => console.error(err));

    // cargar carrito
    fetch("https://localhost:4000/api/v1/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch((err) =>
        console.error(t('productDetails.cartError'), err)
      );
  }, [slug, token, t]);

  if (!product) return <p>{t('productDetails.loading')}</p>;

  // --- funciones de acciones ---
  const addToCart = (productId) => {
    fetch("https://localhost:4000/api/v1/cart/add_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          setCart(data.cart);
          alert(t('productDetails.addedToCart'));
        } else if (data.errors) {
          alert(t('productDetails.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        alert(t('productDetails.cartAddError'));
      });
  };

  // ✅ toggle favoritos
  const toggleFavorite = async (productId) => {
    if (isFavorite) {
      // ❌ quitar favorito
      try {
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error(t('productDetails.removeFavoriteError'), err);
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
          setIsFavorite(true);
        }
      } catch (err) {
        console.error(t('productDetails.addFavoriteError'), err);
      }
    }
  };

  return (
    <div className="product-details-page">
      <div className="product-container">
        <div className="product-image">
          <img
            src={
              product.imagen_url ||
              "https://via.placeholder.com/400x300?text=Sin+imagen"
            }
            alt={product.nombre_producto}
          />
        </div>

        <div className="product-info">
          <h2>{product.nombre_producto}</h2>
          <p>{product.descripcion}</p>
          <p className="price">{t('productDetails.price')}: {formatCOP(product.precio_producto)}</p>
          <p>{t('productDetails.category')}: {product.categoria_nombre}</p>

          {/* botones de acción */}
          <div className="actions">
            <button onClick={() => addToCart(product.id)}>
              {t('productDetails.addToCart')}
            </button>
            <IconButton onClick={() => toggleFavorite(product.id)}>
              {isFavorite ? (
                <Favorite sx={{ color: "white" }} />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;