import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import FilterListIcon from '@mui/icons-material/FilterList';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";
import noImage from "../../assets/images/no_image.png";
import { useOutletContext } from "react-router-dom";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null); // ⬅️ asc | desc
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetch("https://localhost:4000/api/v1/products", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch("https://localhost:4000/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch("https://localhost:4000/api/v1/cart", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch("https://localhost:4000/api/v1/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
    .then(([productsData, categoriesData, cartData, favoritesData]) => {
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      const arr = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [];
      const normalized = arr.map(c => ({
        id: c.id_categoria || c.id,
        nombre: c.nombre_categoria || c.nombre
      }));
      setCategories(normalized);
      setCart(cartData.cart);
    })
    .catch(err => console.error("Error cargando datos", err))
    .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <p>{t('products.notAuthenticated')}</p>;

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <CircularProgress style={{ color: "#ff4d94" }} />
        <p style={{ color: "#ff4d94", marginTop: "10px" }}>Cargando...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <CircularProgress style={{ color: "pink" }} />
        <p style={{ color: "pink", marginTop: "10px" }}>Cargando...</p>
      </div>
    );
  }

  // --- FILTROS ---
  let filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => {
        const catId = p.categoria_id || p.category_id;
        return String(catId) === String(selectedCategory);
      });

  // Ordenar
  if (sortOrder === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio_producto - b.precio_producto);
  } else if (sortOrder === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio_producto - a.precio_producto);
  }

  // Rango
  if (priceRange.min || priceRange.max) {
    filteredProducts = filteredProducts.filter(p => {
      const price = p.precio_producto;
      return (
        (priceRange.min === "" || price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || price <= parseFloat(priceRange.max))
      );
    });
  }

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    handleFilterClose();
  };

  const handleSort = (order) => {
    setSortOrder(order);
    handleFilterClose();
  };

  const handleApplyPriceRange = () => {
    handleFilterClose();
  };

  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        // ❌ quitar favorito
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      } else {
        // ❤️ añadir favorito
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
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };

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

  return (
    <section className="mt-5">
      {/* Encabezado con botón de filtro y título */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginTop: "40px" }}>
        <div style={{ position: "absolute", left: 15, top: -20, display: "flex", gap: 8 }}>
          <IconButton
            onClick={handleFilterClick}
            aria-controls={Boolean(anchorEl) ? 'filter-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            size="sm"
            variant="outlined"
            title={t('products.filter')}
          >
            <FilterListIcon />
          </IconButton>

          {(selectedCategory !== "Todos" || sortOrder || priceRange.min || priceRange.max) && (
            <Chip
              label="Filtros activos"
              onDelete={() => {
                setSelectedCategory("Todos");
                setSortOrder(null);
                setPriceRange({ min: "", max: "" });
              }}
              size="small"
              color="primary"
            />
          )}
        </div>

        <h2 style={{ textAlign: "center", flex: 1, marginTop: "20px" }}>
          {t('products.allProducts')}
        </h2>
      </div>

      {/* Menú mejorado */}
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { width: 250, padding: 1.5 }
        }}
      >
        {/* Categorías */}
        <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: "bold" }}>
          Categorías
        </Typography>
        <MenuItem
          selected={selectedCategory === "Todos"}
          onClick={() => handleSelectCategory("Todos")}
        >
          Todos
        </MenuItem>
        {categories.map(cat => (
          <MenuItem
            key={cat.id}
            selected={String(cat.id) === String(selectedCategory)}
            onClick={() => handleSelectCategory(cat.id)}
          >
            {cat.nombre}
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Ordenar por precio */}
        <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: "bold" }}>
          Ordenar por precio
        </Typography>
        <MenuItem onClick={() => handleSort("asc")}>Menor a mayor</MenuItem>
        <MenuItem onClick={() => handleSort("desc")}>Mayor a menor</MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Rango de precios */}
        <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: "bold" }}>
          Rango de precios
        </Typography>
        <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
          <input
            type="number"
            placeholder="Mín"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            style={{ width: "50%", padding: "4px" }}
          />
          <input
            type="number"
            placeholder="Máx"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            style={{ width: "50%", padding: "4px" }}
          />
        </div>
        <MenuItem
          onClick={() => {
            handleApplyPriceRange();
            handleFilterClose();
          }}
          sx={{ justifyContent: "center", fontWeight: "bold", color: "primary.main" }}
        >
          Aplicar
        </MenuItem>
      </Menu>

      {/* Grid de productos */}
      <div className="productos-grid" style={{ marginTop: "40px" }}>
        {filteredProducts.map((prod) => (
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
