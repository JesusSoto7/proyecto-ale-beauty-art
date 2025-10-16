import React, { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import Rating from "@mui/material/Rating";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import "../assets/stylesheets/SubCateProds.css";
import { formatCOP } from "../services/currency";
import noImage from "../assets/images/no_image.png";

export default function ProductsPageSubCategory() {
  const { categorySlug, subCategorySlug, lang } = useParams();
  const { t } = useTranslation();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [subCategory, setSubCategory] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  function GradientHeart({ filled = false, size = 36 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ display: "block" }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="heart-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#cf0d5bff"/>
            <stop offset="1" stopColor="#f7c1dcff"/>
          </linearGradient>
        </defs>
        <path
          d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
          fill={filled ? "url(#heart-gradient)" : "none"}
          stroke="url(#heart-gradient)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  useEffect(() => {
    if (!token) return;

    async function fetchCategoryProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://localhost:4000/api/v1/categories/${categorySlug}/sub_categories/${subCategorySlug}/products_by_sub`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al cargar los productos");
        const data = await res.json();
        console.log("products response", data); // <-- verifica aquí
        const prods = data.products || [];
        setProducts(prods);

        const ratingsObj = {};
        await Promise.all(
          prods.map(async (p) => {
            try {
              const res = await fetch(`https://localhost:4000/api/v1/products/${p.slug}/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const reviews = await res.json();
              if (Array.isArray(reviews) && reviews.length > 0) {
                const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                ratingsObj[p.id] = { avg, count: reviews.length };
              } else {
                ratingsObj[p.id] = { avg: 0, count: 0 };
              }
            } catch {
              ratingsObj[p.id] = { avg: 0, count: 0 };
            }
          })
        );
        setProductRatings(ratingsObj);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryProducts();
  }, [token, categorySlug, subCategorySlug]);


  useEffect(() => {
    if (!token) return;
    async function fetchSubCategory() {
      try {
        const res = await fetch(
          `https://localhost:4000/api/v1/categories/${categorySlug}/sub_categories/${subCategorySlug}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al cargar la subcategoría");
        const data = await res.json();
        console.log("subCategory response", data); // <-- AÑADE ESTO
        setSubCategory(data);
      } catch (err) {
        setSubCategory(null);
      }
    }
    fetchSubCategory();
  }, [token, categorySlug, subCategorySlug]);

  let filteredProducts = products;
  if (priceRange.min || priceRange.max) {
    filteredProducts = filteredProducts.filter((p) => {
      const price = p.precio_producto;
      return (
        (priceRange.min === "" || price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || price <= parseFloat(priceRange.max))
      );
    });
  }
  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter((p) => {
      const productRating = Math.floor(productRatings[p.id]?.avg || 0);
      return selectedRatings.includes(productRating);
    });
  }
  if (sortOrder === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio_producto - b.precio_producto);
  } else if (sortOrder === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio_producto - a.precio_producto);
  }

  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        const res = await fetch(`https://localhost:4000/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) await loadFavorites();
      } else {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) await loadFavorites();
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };

  // NUEVO addToCart: actualiza el carrito y sube el contador, sin alert
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
          // Notifica al header para subir el contador
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        }
        // No alert
      })
      .catch((err) => {
        // Silencia el error y NO muestra alerta
        console.error(t("productDetails.cartAddError"), err);
      });
  };

  if (!token)
    return <p className="text-center">{t("products.notAuthenticated")}</p>;

  if (loading)
    return (
      <div className="loading-container">
        <CircularProgress style={{ color: "#ff4d94" }} />
        <p>Cargando productos...</p>
      </div>
    );

  if (error)
    return (
      <Typography color="error" sx={{ textAlign: "center", mt: 5 }}>
        {error}
      </Typography>
    );

  if (products.length === 0)
    return (
      <Typography sx={{ textAlign: "center", mt: 5, color: "#777" }}>
        No hay productos disponibles en esta subcategoría.
      </Typography>
    );


  function toTitleCase(str) {
    return str ? str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    ) : "";
  }

  return (
    <section className="shop-section">
      <div className="shop-wrapper">
        <div className="shop-header">
        <div >
        <h1
        style={{
            margin: 48,
            fontSize: "3.5rem",
            fontWeight: "bold",
            color: "#000000ff",
            fontFamily: "'Poppins', Arial, sans-serif",
          }}
        >
          {subCategory ? toTitleCase(subCategory.nombre) : "PRODUCTOS"}
        </h1>
        </div>
        </div>
        <div className="shop-container">
          {/* Sidebar de filtros */}
          <aside className="filter-sidebar">
            <h3>Filtros</h3>
            <div className="filter-group">
              <h4>Ordenar por precio</h4>
              <label>
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === null}
                  onChange={() => setSortOrder(null)}
                />
                Sin ordenar
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "asc"}
                  onChange={() => setSortOrder("asc")}
                />
                Menor a mayor
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  checked={sortOrder === "desc"}
                  onChange={() => setSortOrder("desc")}
                />
                Mayor a menor
              </label>
            </div>
            <div className="filter-group">
              <h4>Rango de precio</h4>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="filter-group">
              <h4>Valoración</h4>
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating}>
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating)}
                    onChange={() =>
                      setSelectedRatings((prev) =>
                        prev.includes(rating)
                          ? prev.filter((r) => r !== rating)
                          : [...prev, rating]
                      )
                    }
                  />
                  {"★".repeat(rating)} ({rating})
                </label>
              ))}
            </div>
            {(sortOrder ||
              priceRange.min ||
              priceRange.max ||
              selectedRatings.length > 0) && (
              <button
                className="clear-filters"
                onClick={() => {
                  setSortOrder(null);
                  setPriceRange({ min: "", max: "" });
                  setSelectedRatings([]);
                }}
              >
                Limpiar filtros
              </button>
            )}
          </aside>
          {/* Grid de productos */}
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="product-card custom-product-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/${lang}/producto/${prod.slug}`)}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/${lang}/producto/${prod.slug}`);
                  }
                }}
              >
                <div className="custom-image-wrapper">
                  <img
                    src={prod.imagen_url || noImage}
                    alt={prod.nombre_producto}
                  />
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(prod.id);
                    }}
                    className="custom-favorite-btn"
                    style={{ padding: 0, background: "transparent" }}
                  >
                    {favoriteIds.includes(prod.id)
                      ? <GradientHeart filled />
                      : <GradientHeart filled={false} />
                    }
                  </IconButton>
                </div>
                <div className="custom-product-info">
                  <div className="custom-rating-row-v2">
                    <span style={{ flex: 1 }}></span>
                    <span className="custom-star">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFC107" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "2px", verticalAlign: "middle" }}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span className="custom-rating-number-v2">
                        {productRatings[prod.id]?.avg
                          ? Number(productRatings[prod.id]?.avg).toFixed(1)
                          : "0.0"}
                      </span>
                    </span>
                  </div>
                  <div className="custom-product-name-v2">{prod.nombre_producto}</div>
                  <div className="custom-price-row-v2">
                    <span className="custom-price-v2">{formatCOP(prod.precio_producto)}</span>
                  </div>
                </div>
                <div className="custom-card-footer">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addToCart(prod.id);
                    }}
                    className="custom-add-btn"
                  >
                    {t("products.addToCart")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}