import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import "../../assets/stylesheets/ProductDetails.css";

function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [token] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // ✅ nuevo estado

  // Cargar producto + carrito + favoritos
  useEffect(() => {
    if (!token) {
      alert("No está autenticado");
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
            console.error("Error cargando favoritos:", err)
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
        console.error("Error cargando carrito:", err)
      );
  }, [slug, token]);

  if (!product) return <p>Cargando producto...</p>;

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
          alert("Producto añadido al carrito 🛒");
        } else if (data.errors) {
          alert("Error: " + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error("Error añadiendo producto al carrito: ", err);
        alert("Error añadiendo producto al carrito");
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
          setIsFavorite(true);
        }
      } catch (err) {
        console.error("Error añadiendo favorito:", err);
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
          <p className="price">Precio: ${product.precio_producto}</p>
          <p>Categoría: {product.categoria_nombre}</p>
          <p className="stock">Stock: {product.stock}</p>

          {/* botones de acción */}
          <div className="actions">
            <button onClick={() => addToCart(product.id)}>
              Añadir al carrito
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
