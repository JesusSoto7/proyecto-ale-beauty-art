import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import "../../assets/stylesheets/ProductosCliente.css";
import { useOutletContext } from "react-router-dom";
import { useAlert } from "../../components/AlertProvider.jsx";
import ProductCard from "../../components/ProductCard"; // ✅ IMPORTAR

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
  const { addAlert } = useAlert();
  // ✅ ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse, cartResponse] = await Promise.all([
          fetch("https://localhost:4000/api/v1/products", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://localhost:4000/api/v1/categories", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("https://localhost:4000/api/v1/cart", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!productsResponse.ok) throw new Error('Error cargando productos');
        if (!categoriesResponse.ok) throw new Error('Error cargando categorías');
        if (!cartResponse.ok) throw new Error('Error cargando carrito');

        const [productsData, categoriesData, cartData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          cartResponse.json()
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

  // ✅ EFECTO PARA RESETEAR A PÁGINA 1 CUANDO CAMBIAN LOS FILTROS
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, priceRange, selectedRatings, sortOrder]);

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
    setCurrentPage(1);
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
        console.error(t('productDetails.cartAddError'), err);
        addAlert(t('productDetails.cartAddError'), "error", 3500);
        window.dispatchEvent(new CustomEvent("cartUpdateFailed", { 
          bubbles: false,
          detail: { productId, action: 'add' }
        }));
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
      <div className="prodcli-banner">
        <h1>{t('banner.title')}</h1>
        <p>{t('banner.description')}</p>
      </div>

      <div className="prodcli-contentwrap">
        <div className="prodcli-info-bar">
          <p>
            {t('products.showing')} <strong>{currentProducts.length}</strong> {t('products.of')} <strong>{filteredProducts.length}</strong> {t('products.products')}
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
            {/* ✅ INFORMACIÓN DE PAGINACIÓN */}
            {totalPages > 1 && (
              <span className="prodcli-filtros">
                • {t('products.page')} {currentPage} {t('products.of')} {totalPages}
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

          {/* ✅ PRODUCTOS CON PRODUCTCARD Y PAGINACIÓN */}
          <div className="prodcli-main prodcli-main-centered">
            <div className="prodcli-products-grid">
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

            {/* ✅ COMPONENTE DE PAGINACIÓN CON FLECHAS */}
            {totalPages > 1 && (
              <div className="prodcli-pagination">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="prodcli-page-btn"
                >
                  ←
                </button>
                
                <div className="prodcli-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`prodcli-page-number ${currentPage === number ? 'prodcli-page-active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="prodcli-page-btn"
                >
                  →
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