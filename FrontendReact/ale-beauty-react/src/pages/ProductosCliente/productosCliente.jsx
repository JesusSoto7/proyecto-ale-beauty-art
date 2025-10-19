import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Rating from "@mui/material/Rating";
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
  const [selectedSubcategory, setSelectedSubcategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [productRatings, setProductRatings] = useState({});
  const [selectedRatings, setSelectedRatings] = useState([]);

  const { lang } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, cartResponse, favoritesResponse] = await Promise.all([
          fetch("https://localhost:4000/api/v1/products", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://localhost:4000/api/v1/categories", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://localhost:4000/api/v1/cart", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://localhost:4000/api/v1/favorites", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!productsResponse.ok) throw new Error('Error cargando productos');
        if (!categoriesResponse.ok) throw new Error('Error cargando categorías');
        if (!cartResponse.ok) throw new Error('Error cargando carrito');
        if (!favoritesResponse.ok) throw new Error('Error cargando favoritos');

        const [productsData, categoriesData, cartData, favoritesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          cartResponse.json(),
          favoritesResponse.json()
        ]);

        const prods = Array.isArray(productsData) ? productsData : productsData.products || [];
        setProducts(prods);

        const arr = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [];
        setCategories(arr);

        const ratingsObj = {};
        await Promise.all(prods.map(async (p) => {
          try {
            const res = await fetch(`https://localhost:4000/api/v1/products/${p.slug}/reviews`, {
              headers: { Authorization: `Bearer ${token}` }
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
        }));
        setProductRatings(ratingsObj);

        setCart(cartData.cart);

      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

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

  const getSubcategoriesForCategory = (categoryId) => {
    if (categoryId === "Todos") return [];
    const category = categories.find(c => 
      String(c.id_categoria || c.id) === String(categoryId)
    );
    return category?.sub_categories || [];
  };

  const filteredSubcategories = getSubcategoriesForCategory(selectedCategory);

  let filteredProducts = products;

  if (selectedSubcategory !== "Todos") {
    filteredProducts = filteredProducts.filter(p => {
      const productSubcatId = p.sub_category_id;
      return String(productSubcatId) === String(selectedSubcategory);
    });
  } else if (selectedCategory !== "Todos") {
    const categorySubcategories = getSubcategoriesForCategory(selectedCategory);
    const subcategoryIds = categorySubcategories.map(
      sc => String(sc.id_subcategoria || sc.id)
    );
    filteredProducts = filteredProducts.filter(p => {
      const productSubcatId = String(p.sub_category_id || p.id_subcategoria || p.subcategory_id);
      const productCatId = String(p.category_id || p.categoria_id);
      return subcategoryIds.includes(productSubcatId) || productCatId === String(selectedCategory);
    });
  }

  if (priceRange.min || priceRange.max) {
    filteredProducts = filteredProducts.filter(p => {
      const price = p.precio_producto;
      return (
        (priceRange.min === "" || price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || price <= parseFloat(priceRange.max))
      );
    });
  }

  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productRating = Math.floor(productRatings[p.id]?.avg || 0);
      return selectedRatings.includes(productRating);
    });
  }

  if (sortOrder === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio_producto - b.precio_producto);
  } else if (sortOrder === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio_producto - a.precio_producto);
  }

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory("Todos");
  };

  const handleSelectSubcategory = (subcatId) => {
    setSelectedSubcategory(subcatId);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory("Todos");
    setSelectedSubcategory("Todos");
    setSortOrder(null);
    setPriceRange({ min: "", max: "" });
    setSelectedRatings([]);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(item => item !== rating)
        : [...prev, rating]
    );
  };

  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites();
        }
      } else {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites();
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
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        } else if (data.errors) {
          alert(t('productDetails.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        alert(t('productDetails.cartAddError'));
      });
  };

  if (!token) return <p>{t('products.notAuthenticated')}</p>;

  if (loading) {
    return (
      <div className="prodcli-loading">
        <CircularProgress style={{ color: "#ff4d94" }} />
        <p>{t('products.loading')}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="prodcli-loading">
        <CircularProgress style={{ color: "pink" }} />
        <p>{t('products.loading')}</p>
      </div>
    );
  }

  return (
    <section className="prodcli-section prodcli-centered">
      {/* Banner gris grande */}
      <div className="prodcli-banner">
        <h1>{t('banner.title')}</h1>
        <p>{t('banner.description')}</p>
      </div>

      <div className="prodcli-contentwrap">
        <div className="prodcli-info-bar">
          <p>
            {t('products.showing')} <strong>{filteredProducts.length}</strong> {t('products.of')} <strong>{products.length}</strong> {t('products.products')}
            {selectedCategory !== "Todos" && (
              <span className="prodcli-filtros">
                • {t('products.category')}: {categories.find(c => String(c.id_categoria || c.id) === String(selectedCategory))?.nombre_categoria}
              </span>
            )}
            {selectedSubcategory !== "Todos" && (
              <span className="prodcli-filtros">
                • {t('products.subcategory')}: {filteredSubcategories.find(sc => String(sc.id_subcategoria || sc.id) === String(selectedSubcategory))?.nombre_subcategoria}
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="prodcli-filtros">
                • {t('products.price')}: {priceRange.min ? `$${priceRange.min}` : t('products.min')} - {priceRange.max ? `$${priceRange.max}` : t('products.max')}
              </span>
            )}
            {selectedRatings.length > 0 && (
              <span className="prodcli-filtros">
                • {t('products.rating')}: {selectedRatings.map(r => `${r}★`).join(", ")}
              </span>
            )}
          </p>
        </div>

        <div className="prodcli-mainrow prodcli-mainrow-centered">
          {/* Sidebar de filtros */}
          <div className="prodcli-sidebar">
            <Typography variant="h6" className="prodcli-sidebar-title">
              {t('filters.title')}
            </Typography>
            
            <div className="prodcli-sidebar-section">
              <Typography variant="subtitle1" className="prodcli-sidebar-subtitle">
                {t('filters.categories')}
              </Typography>
              <div className="prodcli-radio-col">
                <label>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "Todos"}
                    onChange={() => handleSelectCategory("Todos")}
                  />
                  {t('filters.allCategories')}
                </label>
                {categories.map(cat => (
                  <label key={cat.id_categoria || cat.id}>
                    <input
                      type="radio"
                      name="category"
                      checked={String(cat.id_categoria || cat.id) === String(selectedCategory)}
                      onChange={() => handleSelectCategory(cat.id_categoria || cat.id)}
                    />
                    {cat.nombre_categoria || cat.nombre}
                  </label>
                ))}
              </div>
            </div>

            <div className="prodcli-sidebar-section">
              <Typography variant="subtitle1" className="prodcli-sidebar-subtitle">
                {t('filters.subcategories')}
              </Typography>
              <div className="prodcli-radio-col">
                <label>
                  <input
                    type="radio"
                    name="subcategory-all"
                    checked={selectedSubcategory === "Todos"}
                    onChange={() => handleSelectSubcategory("Todos")}
                  />
                  {t('filters.allSubcategories')}
                </label>
                {filteredSubcategories.map(sub => (
                  <label key={sub.id_subcategoria || sub.id}>
                    <input
                      type="radio"
                      name="subcategory"
                      checked={String(sub.id_subcategoria || sub.id) === String(selectedSubcategory)}
                      onChange={() => handleSelectSubcategory(sub.id_subcategoria || sub.id)}
                    />
                    {sub.nombre_subcategoria || sub.nombre}
                  </label>
                ))}
                {filteredSubcategories.length === 0 && selectedCategory !== "Todos" && (
                  <p className="prodcli-nosc">{t('filters.noSubcategories')}</p>
                )}
              </div>
            </div>

            <div className="prodcli-sidebar-section">
              <Typography variant="subtitle1" className="prodcli-sidebar-subtitle">
                {t('filters.sortByPrice')}
              </Typography>
              <div className="prodcli-radio-col">
                <label>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === null}
                    onChange={() => handleSort(null)}
                  />
                  {t('filters.unsorted')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === "asc"}
                    onChange={() => handleSort("asc")}
                  />
                  {t('filters.lowToHigh')}
                </label>
                <label>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === "desc"}
                    onChange={() => handleSort("desc")}
                  />
                  {t('filters.highToLow')}
                </label>
              </div>
            </div>

            <div className="prodcli-sidebar-section">
              <Typography variant="subtitle1" className="prodcli-sidebar-subtitle">
                {t('filters.priceRange')}
              </Typography>
              <div className="prodcli-pricerange">
                <input
                  type="number"
                  placeholder="$10.00"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange(e.target.value, priceRange.max)}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="$100.00"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                />
              </div>
            </div>

            <div className="prodcli-sidebar-section">
              <Typography variant="subtitle1" className="prodcli-sidebar-subtitle">
                {t('products.rating')}
              </Typography>
              <div className="prodcli-radio-col">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating}>
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => handleRatingChange(rating)}
                    />
                    <span className="prodcli-star">{'★'.repeat(rating)}</span>
                    {rating} {rating !== 1 ? t('products.stars') : t('products.star')}
                  </label>
                ))}
              </div>
            </div>

            {(selectedCategory !== "Todos" || selectedSubcategory !== "Todos" || sortOrder || priceRange.min || priceRange.max || selectedRatings.length > 0) && (
              <button 
                onClick={handleClearAllFilters}
                className="prodcli-clearbtn"
              >
                {t('products.clearFilters')}
              </button>
            )}
          </div>

          {/* Productos */}
          <div className="prodcli-main prodcli-main-centered">
            <div className="prodcli-grid prodcli-grid-3cols">
              {filteredProducts.map((prod, index) => (
                <div 
                  key={prod.id} 
                  className="custom-product-card"
                  style={{ animationDelay: `${index * 0.1}s`, cursor: "pointer" }}
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
                      onError={(e) => { e.currentTarget.src = noImage; }}
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
                    <div className="custom-product-name-v2">{prod.nombre_producto}</div>
                    
                    {/* PRECIO con descuento y tachado */}
                    <div className="custom-price-v2">
                      {prod.precio_con_mejor_descuento && prod.precio_con_mejor_descuento < prod.precio_producto ? (
                        <>
                          <span>{formatCOP(prod.precio_con_mejor_descuento)}</span>
                          <span className="line-through">{formatCOP(prod.precio_producto)}</span>
                        </>
                      ) : (
                        <span>{formatCOP(prod.precio_producto)}</span>
                      )}
                    </div>

                    {/* Nombre del descuento si existe */}
                    {prod.mejor_descuento_para_precio && (
                      <div className="custom-descuento-nombre">
                        {prod.mejor_descuento_para_precio.nombre}
                        {prod.mejor_descuento_para_precio.tipo === "porcentaje"
                          ? ` (${prod.mejor_descuento_para_precio.valor}%)`
                          : ` (-${formatCOP(prod.mejor_descuento_para_precio.valor)})`}
                      </div>
                    )}

                    {/* Rating ABAJO del precio */}
                    <div className="custom-rating-row-v2">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFC107" style={{ marginRight: "2px", verticalAlign: "middle" }}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span className="custom-rating-number-v2">
                        {productRatings[prod.id]?.avg
                          ? Number(productRatings[prod.id]?.avg).toFixed(1)
                          : "0.0"}
                      </span>
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
                      {t('products.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({length: Math.max(0, 3 - filteredProducts.length)}).map((_, idx) => (
                <div className="prodcli-placeholder" key={`ph-${idx}`}></div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="prodcli-empty">
                <p>{t('products.noProducts')}</p>
                <p>
                  {selectedCategory !== "Todos" || selectedSubcategory !== "Todos" 
                    ? t('products.noProductsFilter') 
                    : t('products.tryOtherFilters')}
                </p>
                <button 
                  onClick={handleClearAllFilters}
                  className="prodcli-clearbtn"
                >
                  {t('products.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductosCliente;