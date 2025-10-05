import React, { useEffect, useState } from "react";
import { Link, useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import "../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../services/currency";
import noImage from "../assets/images/no_image.png";

export default function ProductsPageSubCategory() {
  const { categoryId, subCategoryId, lang } = useParams();
  const { t } = useTranslation();
  const { favoriteIds, loadFavorites } = useOutletContext();

  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  // Cargar productos de la subcategoría
  useEffect(() => {
    if (!token) return;

    async function fetchCategoryProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://localhost:4000/api/v1/categories/${categoryId}/sub_categories/${subCategoryId}/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar los productos");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [token, categoryId, subCategoryId]);

  // Favoritos
  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        // Quitar favorito
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) await loadFavorites();
      } else {
        // Agregar favorito
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) await loadFavorites();
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };

  // Añadir al carrito
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
          alert(t("productDetails.addedToCart"));
        } else if (data.errors) {
          alert(t("productDetails.error") + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t("productDetails.cartAddError"), err);
        alert(t("productDetails.cartAddError"));
      });
  };

  if (!token) return <p>{t("products.notAuthenticated")}</p>;

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <CircularProgress style={{ color: "#ff4d94" }} />
        <p style={{ color: "#ff4d94", marginTop: "10px" }}>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 5 }}>
        {t("categoryProducts.errorLoad") || error}
      </Typography>
    );
  }

  if (products.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", mt: 5, color: "#777" }}>
        No hay productos disponibles en esta subcategoría.
      </Typography>
    );
  }

  return (
    <section className="mt-5">
      <h2 style={{ textAlign: "center", marginTop: "40px" }}>
        {"productos"}
      </h2>

      <div className="productos-grid" style={{ marginTop: "40px" }}>
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
                  onError={(e) => {
                    e.currentTarget.src = noImage;
                  }}
                />
              </div>
              <h5>{prod.nombre_producto}</h5>
              <p>{formatCOP(prod.precio_producto)}</p>
            </Link>

            <div className="actions">
              <button onClick={() => addToCart(prod.id)}>
                {t("products.addToCart")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
