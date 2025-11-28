import React, { useEffect, useState, useRef } from "react";
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

export default function ProductsPageSubCategory() {
  const { categorySlug, subCategorySlug, lang } = useParams();
  const { t } = useTranslation();
  const { favoriteIds, loadFavorites } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  
  // ✅ SOLO UN ESTADO para precios aplicados
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: "", max: "" });
  
  // ✅ useRef para almacenar los valores de input SIN causar re-renders
  const priceInputsRef = useRef({ min: "", max: "" });
  
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

        const res = await fetch(`${API_BASE}/api/v1/categories/${categorySlug}/sub_categories/${subCategorySlug}/products_by_sub`);
        if (!res.ok) throw new Error("Error al cargar los productos");
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);

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
  }, [sortOrder, appliedPriceRange, selectedRatings]);

  let filteredProducts = [...products];

  if (appliedPriceRange.min || appliedPriceRange.max) {
    filteredProducts = filteredProducts.filter((p) => {
      const price = Number(p.precio_producto ?? 0);
      return (
        (appliedPriceRange.min === "" || price >= parseFloat(appliedPriceRange.min)) &&
        (appliedPriceRange.max === "" || price <= parseFloat(appliedPriceRange.max))
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // ✅ FUNCIÓN PARA APLICAR FILTRO (solo cuando el usuario decide)
  const applyPriceFilter = () => {
    setAppliedPriceRange({
      min: priceInputsRef.current.min,
      max: priceInputsRef.current.max
    });
  };

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS EN INPUTS (NO causa re-render)
  const handlePriceInputChange = (field, value) => {
    // Solo actualizar el ref, NO el estado (evita re-render)
    priceInputsRef.current[field] = value;
  };

  // ✅ COMPONENTE SEPARADO para inputs de precio (evita re-render del componente principal)
  const PriceInputs = () => {
    const [localMin, setLocalMin] = useState(priceInputsRef.current.min);
    const [localMax, setLocalMax] = useState(priceInputsRef.current.max);

    const handleLocalChange = (field, value) => {
      if (field === 'min') setLocalMin(value);
      if (field === 'max') setLocalMax(value);
      
      // Actualizar el ref
      priceInputsRef.current[field] = value;
    };

    const handleApply = () => {
      setAppliedPriceRange({
        min: priceInputsRef.current.min,
        max: priceInputsRef.current.max
      });
    };

    return (
      <div className="filter-group">
        <h4>Rango de precio</h4>
        <div className="price-range">
          <input
            type="text"
            inputMode="decimal"
            placeholder="Min"
            value={localMin}
            onChange={(e) => handleLocalChange("min", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply();
                e.target.blur();
              }
            }}
          />
          <span>-</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Max"
            value={localMax}
            onChange={(e) => handleLocalChange("max", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply();
                e.target.blur();
              }
            }}
          />
        </div>
        <button 
          onClick={handleApply}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            backgroundColor: '#ff4d94',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            width: '100%'
          }}
        >
          Aplicar precio
        </button>
      </div>
    );
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
    const product = products.find((p) => p.id === item.id);

    if (product) {
      window.gtag && window.gtag('event', 'add_to_cart', {
        currency: 'COP',
        items: [{
          item_id: product.id,
          item_name: product.nombre_producto,
          price: product.precio_producto,
          item_category: subCategory?.nombre || '',
          item_variant: product.sku || '',
          quantity: 1,
        }]
      });
    }

    fetch(`${API_BASE}/api/v1/cart/add_product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: item.id }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) {
          setCart(data.cart);
          addAlert("Producto añadido al carrito.", "success", 3500);
        }
      })
      .catch(() => {
        addAlert(t("productDetails.cartAddError") || "No se pudo agregar al carrito", "error", 3500);
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

      {/* ✅ USAR COMPONENTE SEPARADO PARA INPUTS DE PRECIO */}
      <PriceInputs />

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

      {(sortOrder || appliedPriceRange.min || appliedPriceRange.max || selectedRatings.length > 0) && (
        <button
          className="clear-filters"
          onClick={() => {
            setSortOrder(null);
            setAppliedPriceRange({ min: "", max: "" });
            priceInputsRef.current = { min: "", max: "" };
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
          {!isMdDown && (
            <aside className="filter-sidebar">
              <FiltersPanel />
            </aside>
          )}

          <div className="products-main">
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
                    setAppliedPriceRange({ min: "", max: "" });
                    priceInputsRef.current = { min: "", max: "" };
                    setSelectedRatings([]);
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}

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