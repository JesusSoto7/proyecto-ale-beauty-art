import React, { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import FilterListIcon from "@mui/icons-material/FilterList";
import "../assets/stylesheets/SubCateProds.css";
import "../assets/stylesheets/ProductosCliente.css";
import { useAlert } from "../components/AlertProvider.jsx";
import ProductCard from "../components/ProductCard";
import { addItem as addGuestItem } from "../utils/guestCart.js";

const normalizeToken = (raw) => (raw && raw !== "null" && raw !== "undefined" ? raw : null);

export default function ProductsPageSubCategory() {
  const { categorySlug, subCategorySlug, lang } = useParams();
  const { t } = useTranslation();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [categories, setCategories] = useState([]);
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

  // ✅ ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);

  // ✅ ESTADOS PARA FILTROS MÓVILES
  const isMdDown = useMediaQuery('(max-width: 992px)');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isSmallTwoCol = viewportWidth >= 370 && viewportWidth <= 430;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken || null);
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        setLoading(true);
        setError(null);

        // Productos por subcategoría (público)
        const res = await fetch(`${API_BASE}/api/v1/categories/${categorySlug}/sub_categories/${subCategorySlug}/products_by_sub`);
        if (!res.ok) throw new Error("Error al cargar los productos");
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);

        // Ratings: headers opcionales
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const ratingsObj = {};
        await Promise.all(
          prods.map(async (p) => {
            try {
              const r = await fetch(`${API_BASE}/api/v1/products/${p.slug}/reviews`, { headers });
              if (r.status === 401) { ratingsObj[p.id] = { avg: 0, count: 0 }; return; }
              const reviews = await r.json();
              if (Array.isArray(reviews) && reviews.length > 0) {
                const avg = reviews.reduce((sum, rr) => sum + rr.rating, 0) / reviews.length;
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
    if (products && products.length > 0) {
      window.gtag && window.gtag('event', 'view_item_list', {
        items: products.map((prod) => ({
          item_id: prod.id,
          item_name: prod.nombre_producto,
          price: prod.precio_producto,
          item_category: subCategory?.nombre || '',
          item_variant: prod.sku || '',
        }))
      });
    }
  }, [products, subCategory]);

  useEffect(() => {
    async function fetchSubCategory() {
      try {
        // Subcategoría (público)
        const res = await fetch(`${API_BASE}/api/v1/categories/${categorySlug}/sub_categories/${subCategorySlug}`);
        if (!res.ok) throw new Error("Error al cargar la subcategoría");
        const data = await res.json();
        setSubCategory(data);
      } catch {
        setSubCategory(null);
      }
    }
    fetchSubCategory();
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, priceRange, selectedRatings]);

  let filteredProducts = [...products];

  if (priceRange.min || priceRange.max) {
    filteredProducts = filteredProducts.filter((p) => {
      const price = Number(p.precio_producto ?? 0);
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

  // ✅ LÓGICA DE PAGINACIÓN
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ✅ FUNCIONES DE PAGINACIÓN
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleFavorite = async (productId) => {
    if (!token) {
      addAlert(t("productDetails.loginToFavorite") || "Inicia sesión para gestionar favoritos", "info", 3500);
      return;
    }
    try {
      if (favoriteIds.includes(productId)) {
        const res = await fetch(`${API_BASE}/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          await loadFavorites?.();
          addAlert("Se eliminó de tus favoritos", "warning", 3500);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/v1/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites?.();
          addAlert("Se agregó a tus favoritos", "success", 3500);
        }
      }
    } catch {
      addAlert("Algo salió mal", "error", 3500);
    }
  };

  const addToCart = (item) => {
    const product = typeof item === "object" ? item : products.find((p) => String(p.id) === String(item));
    const productId = product?.id ?? item;

    // Reportar `add_to_cart` a Google Analytics
    if (product) {
      window.gtag && window.gtag('event', 'add_to_cart', {
        currency: 'COP', // Cambia a la moneda que estés usando
        items: [{
          item_id: product.id,
          item_name: product.nombre_producto,
          price: product.precio_producto,
          item_category: categories.find((cat) => String(cat.id_categoria || cat.id) === String(product.category_id))?.nombre_categoria || '',
          item_variant: product.sku || '',
          quantity: 1, // Ajusta cantidad según lógica del carrito
        }]
      });
    }

    // Actualizar carrito (Invitado o Autenticado)
    const tok = normalizeToken(localStorage.getItem("token") || token);

    if (!tok) {
      // Lógica para usuario invitado
      window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", { bubbles: false }));
      if (product) addGuestItem(product, 1); // emite `guestCartUpdated`
      window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
      addAlert(t("productDetails.addedToCart") || "Se agregó al carrito", "success", 3500);
      return;
    }

    // Lógica para usuario autenticado
    window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", {
      bubbles: false,
      detail: { productId, action: 'add' },
    }));

    fetch(`${API_BASE}/api/v1/cart/add_product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tok}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then((data) => {
        const serverCart = data?.cart || data;
        if (serverCart?.products) {
          setCart(serverCart);
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
          addAlert(t("productDetails.addedToCart") || "Se agregó al carrito", "success", 3500);
        } else {
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        }
      })
      .catch(() => {
        addAlert(t('productDetails.cartAddError') || "No se pudo agregar al carrito", "error", 3500);
        window.dispatchEvent(new CustomEvent("cartUpdateFailed", {
          bubbles: false,
          detail: { productId, action: 'add' },
        }));
      });
  };

  // ✅ PANEL DE FILTROS REUTILIZABLE
  const FiltersPanel = () => (
    <>
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

      {(sortOrder || priceRange.min || priceRange.max || selectedRatings.length > 0) && (
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
    </>
  );

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
          {/* Sidebar de filtros (visible en desktop) */}
          {!isMdDown && (
            <aside className="filter-sidebar">
              <FiltersPanel />
            </aside>
          )}

          {/* ✅ GRID CON PRODUCTCARD Y PAGINACIÓN */}
          <div className="products-main">
            {/* Toggle de filtros en móviles/tablets */}
            {isMdDown && (
              <div className={`prodcli-actions-bar ${isSmallTwoCol ? 'prodcli-small-actions' : ''}`}>
                <IconButton
                  className="prodcli-filter-toggle"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Filtros"
                >
                  <FilterListIcon />
                  <span style={{ marginLeft: 8, fontWeight: 600 }}>
                    Filtros
                  </span>
                </IconButton>
              </div>
            )}

            <div className={`prodcli-products-grid ${isSmallTwoCol ? 'prodcli-grid-small' : ''}`}>
              {currentProducts.map((prod, index) => (
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

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>No se encontraron productos con los filtros seleccionados.</p>
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
              </div>
            )}

            {/* ✅ PAGINACIÓN - SOLO SI HAY MÁS DE 10 PRODUCTOS */}
            {filteredProducts.length > 10 && (
              <div className="pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="page-btn prev-btn"
                >
                  ←
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`page-number ${currentPage === number ? 'page-active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="page-btn next-btn"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ DRAWER DE FILTROS PARA MÓVILES/TABLETS */}
      <Drawer
        anchor="left"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 320, p: 2 }} role="presentation">
          <FiltersPanel />
          <button
            onClick={() => setFiltersOpen(false)}
            className="prodcli-clearbtn"
            style={{ marginTop: 12 }}
          >
            Cerrar
          </button>
        </Box>
      </Drawer>
    </section>
  );
}