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
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";
import noImage from "../../assets/images/no_image.png";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [anchorEl, setAnchorEl] = useState(null);
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/products", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch(err => console.error(t('products.loadError'), err));

    fetch("https://localhost:4000/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : data.categories || [];
        const normalized = arr.map(c => ({
          id: c.id_categoria || c.id,
          nombre: c.nombre_categoria || c.nombre
        }));
        setCategories(normalized);
      })
      .catch(err => console.error("Error cargando categorías", err));

    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error(t('products.cartError'), err));

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

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => {
        const catId = p.categoria_id || p.category_id;
        return String(catId) === String(selectedCategory);
      });

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    handleFilterClose();
  };

  return (
    <section className="mt-5">
      {/* Encabezado con título más abajo y filtro arriba a la izquierda */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginTop: "40px" }}>
        {/* Botón de filtro a la izquierda */}
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

          {selectedCategory !== "Todos" && (
            <Chip
              label={categories.find(c => String(c.id) === String(selectedCategory))?.nombre || "Categoría"}
              onDelete={() => setSelectedCategory("Todos")}
              size="small"
            />
          )}
        </div>

        {/* Título centrado más abajo */}
        <h2 style={{ textAlign: "center", flex: 1, marginTop: "20px" }}>
          {t('products.allProducts')}
        </h2>
      </div>

      {/* Menú de categorías */}
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
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
      </Menu>

      {/* Productos más abajo */}
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
