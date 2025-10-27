import React, { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import "../assets/stylesheets/SubCateProds.css";
import { useAlert } from "../components/AlertProvider.jsx";
import ProductCard from "../components/ProductCard"; // ✅ IMPORTAR

export default function ProductsPageSubCategory() {
  const { categorySlug, subCategorySlug, lang } = useParams();
  const { t } = useTranslation();
  const { favoriteIds, loadFavorites } = useOutletContext();

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
  const { addAlert } = useAlert();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

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
        if (res.ok) {
          await loadFavorites();
          addAlert("Se eliminó de tus favoritos", "warning", 3500);
        }
      } else {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites();
          addAlert("Se agregó a tus favoritos", "success", 3500);
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
      addAlert("Algo salió mal", "error", 3500);
    }
  };

  const addToCart = (productId) => {
    // ✅ Optimistic update
    window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", { 
      bubbles: false,
      detail: { productId, action: 'add' }
    }));
    addAlert("Se agregó al carrito", "success", 3500);

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
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        } else if (data.errors) {
          addAlert(t('productDetails.error') + data.errors.join(", "), "error", 3500);
          window.dispatchEvent(new CustomEvent("cartUpdateFailed", { 
            bubbles: false,
            detail: { productId, action: 'add' }
          }));
        }
      })
      .catch((err) => {
        console.error(t("productDetails.cartAddError"), err);
        addAlert(t("productDetails.cartAddError"), "error", 3500);
        window.dispatchEvent(new CustomEvent("cartUpdateFailed", { 
          bubbles: false,
          detail: { productId, action: 'add' }
        }));
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
          <h1>
            {subCategory ? toTitleCase(subCategory.nombre) : "PRODUCTOS"}
          </h1>
        </div>
        
        <div className="shop-container">
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
          
          {/* ✅ GRID CON PRODUCTCARD */}
          <div className="products-grid">
            {filteredProducts.map((prod, index) => (
              <ProductCard
                key={prod.id}
                product={prod}
                lang={lang}
                isFavorite={favoriteIds.includes(prod.id)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                productRating={productRatings[prod.id]}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}