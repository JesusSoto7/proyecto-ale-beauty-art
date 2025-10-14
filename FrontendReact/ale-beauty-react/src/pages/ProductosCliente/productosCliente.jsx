import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
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

        // Procesar productos
        const prods = Array.isArray(productsData) ? productsData : productsData.products || [];
        setProducts(prods);

        // DEBUG: Ver estructura real de productos
        console.log("=== ESTRUCTURA DE PRODUCTOS ===");
        if (prods.length > 0) {
          console.log("Primer producto completo:", prods[0]);
          console.log("Campos del primer producto:", Object.keys(prods[0]));
          
          // Ver campos de subcategoría en los primeros 3 productos
          prods.slice(0, 3).forEach((p, i) => {
            console.log(`Producto ${i} - ${p.nombre_producto}:`, {
              id: p.id,
              sub_category_id: p.sub_category_id,
              subcategoria_id: p.subcategoria_id,
              subcategory_id: p.subcategory_id
            });
          });
        }

        // Procesar categorías
        const arr = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [];
        setCategories(arr);

        // DEBUG: Ver estructura real de categorías y subcategorías
        console.log("=== ESTRUCTURA DE CATEGORÍAS Y SUBCATEGORÍAS ===");
        if (arr.length > 0) {
          arr.forEach((cat, i) => {
            console.log(`Categoría ${i} - ${cat.nombre_categoria || cat.nombre}:`, {
              id: cat.id,
              id_categoria: cat.id_categoria,
              sub_categories: cat.sub_categories ? cat.sub_categories.map(sc => ({
                id: sc.id,
                id_subcategoria: sc.id_subcategoria,
                nombre: sc.nombre_subcategoria || sc.nombre,
                categoria_id: sc.categoria_id
              })) : 'No tiene subcategorías'
            });
          });
        }

        // Cargar ratings
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

  // Obtener subcategorías de la categoría seleccionada
  const getSubcategoriesForCategory = (categoryId) => {
    if (categoryId === "Todos") return [];
    
    const category = categories.find(c => 
      String(c.id_categoria || c.id) === String(categoryId)
    );
    
    return category?.sub_categories || [];
  };

  const filteredSubcategories = getSubcategoriesForCategory(selectedCategory);

  // --- FILTROS CORREGIDOS CON LA NUEVA ESTRUCTURA ---
  let filteredProducts = products;

  console.log("=== INICIO FILTRADO ===");
  console.log("Productos totales:", products.length);
  console.log("Categoría seleccionada:", selectedCategory);
  console.log("Subcategoría seleccionada:", selectedSubcategory);

  // 1. Primero filtro por subcategoría (si está seleccionada)
  if (selectedSubcategory !== "Todos") {
    console.log("🔍 FILTRANDO POR SUBCATEGORÍA:", selectedSubcategory);
    
    filteredProducts = filteredProducts.filter(p => {
      // Buscar en el campo sub_category_id (con guion bajo)
      const productSubcatId = p.sub_category_id;
      const matches = String(productSubcatId) === String(selectedSubcategory);
      
      console.log(`Producto ${p.id} - ${p.nombre_producto}:`, {
        sub_category_id: p.sub_category_id,
        selectedSubcategory: selectedSubcategory,
        matches: matches
      });
      
      return matches;
    });
    
    console.log("📊 Productos después de filtrar por subcategoría:", filteredProducts.length);
  } 
  // 2. Si no hay subcategoría seleccionada, filtrar por categoría
  else if (selectedCategory !== "Todos") {
    console.log("🔍 FILTRANDO POR CATEGORÍA:", selectedCategory);
    
    // Obtener todas las subcategorías de esta categoría
    const categorySubcategories = getSubcategoriesForCategory(selectedCategory);
    const subcategoryIds = categorySubcategories.map(sc => sc.id_subcategoria || sc.id);
    
    console.log("Subcategorías de esta categoría:", subcategoryIds);
    
    filteredProducts = filteredProducts.filter(p => {
      // El producto pertenece a la categoría si su sub_category_id está en las subcategorías de esta categoría
      const productSubcatId = p.sub_category_id;
      const matches = subcategoryIds.includes(String(productSubcatId));
      
      console.log(`Producto ${p.id} - ${p.nombre_producto}:`, {
        sub_category_id: productSubcatId,
        subcategoryIds: subcategoryIds,
        matches: matches
      });
      
      return matches;
    });
    
    console.log("📊 Productos después de filtrar por categoría:", filteredProducts.length);
  }

  // 3. Resto de filtros (precio, rating, ordenamiento)
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

  console.log("🎯 Productos finales filtrados:", filteredProducts.length);
  console.log("=== FIN FILTRADO ===");

  const handleSelectCategory = (catId) => {
    console.log("📝 Seleccionando categoría:", catId);
    setSelectedCategory(catId);
    setSelectedSubcategory("Todos"); // Resetear subcategoría al cambiar categoría
  };

  const handleSelectSubcategory = (subcatId) => {
    console.log("📝 Seleccionando subcategoría:", subcatId);
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
            Authorization: `Bearer ${token}`,
          },
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

  return (
    <section style={{marginTop: "90px"}}>
      {/* Banner gris grande */}
      <div style={{
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        textAlign: "center",
        marginBottom: "30px",
        borderBottom: "1px solid #e0e0e0",
        width: "100%"
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#333",
          fontFamily: "Arial, sans-serif"
        }}>
          PRODUCTOS
        </h1>
        <p style={{
          margin: "10px 0 0 0",
          fontSize: "1.1rem",
          color: "#666",
          fontFamily: "Arial, sans-serif"
        }}>
          Descubre nuestra amplia selección de productos
        </p>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px 0",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: "14px", 
            color: "#666",
            fontFamily: "Arial, sans-serif"
          }}>
            Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
            {selectedCategory !== "Todos" && (
              <span style={{marginLeft: "10px", color: "#ff4d94"}}>
                • Categoría: {categories.find(c => String(c.id_categoria || c.id) === String(selectedCategory))?.nombre_categoria}
              </span>
            )}
            {selectedSubcategory !== "Todos" && (
              <span style={{marginLeft: "10px", color: "#ff4d94"}}>
                • Subcategoría: {filteredSubcategories.find(sc => String(sc.id_subcategoria || sc.id) === String(selectedSubcategory))?.nombre_subcategoria}
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span style={{marginLeft: "10px", color: "#ff4d94"}}>
                • Precio: {priceRange.min ? `$${priceRange.min}` : "Mín"} - {priceRange.max ? `$${priceRange.max}` : "Máx"}
              </span>
            )}
            {selectedRatings.length > 0 && (
              <span style={{marginLeft: "10px", color: "#ff4d94"}}>
                • Rating: {selectedRatings.map(r => `${r}★`).join(", ")}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "30px" }}>
          {/* Sidebar de filtros */}
          <div style={{ width: "250px", flexShrink: 0 }}>
            <Typography variant="h6" style={{ marginBottom: "15px", fontWeight: "bold" }}>
              Filtros
            </Typography>

            {/* Categorías */}
            <div style={{ marginBottom: "25px" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Categorías
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "Todos"}
                    onChange={() => handleSelectCategory("Todos")}
                    style={{ marginRight: "8px" }}
                  />
                  Todas las categorías
                </label>
                {categories.map(cat => (
                  <label key={cat.id_categoria || cat.id} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="category"
                      checked={String(cat.id_categoria || cat.id) === String(selectedCategory)}
                      onChange={() => handleSelectCategory(cat.id_categoria || cat.id)}
                      style={{ marginRight: "8px" }}
                    />
                    {cat.nombre_categoria || cat.nombre}
                  </label>
                ))}
              </div>
            </div>

            {/* Subcategorías - SOLO MUESTRA LAS DE LA CATEGORÍA SELECCIONADA */}
            <div style={{ marginBottom: "25px" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Subcategorías
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="subcategory-all"
                    checked={selectedSubcategory === "Todos"}
                    onChange={() => handleSelectSubcategory("Todos")}
                    style={{ marginRight: "8px" }}
                  />
                  Todas las subcategorías
                </label>
                {filteredSubcategories.map(sub => (
                  <label key={sub.id_subcategoria || sub.id} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="subcategory"
                      checked={String(sub.id_subcategoria || sub.id) === String(selectedSubcategory)}
                      onChange={() => handleSelectSubcategory(sub.id_subcategoria || sub.id)}
                      style={{ marginRight: "8px" }}
                    />
                    {sub.nombre_subcategoria || sub.nombre}
                  </label>
                ))}
                {filteredSubcategories.length === 0 && selectedCategory !== "Todos" && (
                  <p style={{ fontSize: "12px", color: "#999", margin: "5px 0" }}>
                    No hay subcategorías para esta categoría
                  </p>
                )}
              </div>
            </div>

            {/* Ordenar por precio */}
            <div style={{ marginBottom: "25px" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Ordenar por precio
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === null}
                    onChange={() => handleSort(null)}
                    style={{ marginRight: "8px" }}
                  />
                  Sin ordenar
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === "asc"}
                    onChange={() => handleSort("asc")}
                    style={{ marginRight: "8px" }}
                  />
                  Menor a mayor
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOrder === "desc"}
                    onChange={() => handleSort("desc")}
                    style={{ marginRight: "8px" }}
                  />
                  Mayor a menor
                </label>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: "25px" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Rango de precio
              </Typography>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="number"
                  placeholder="$10.00"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange(e.target.value, priceRange.max)}
                  style={{ width: "80px", padding: "5px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="$100.00"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                  style={{ width: "80px", padding: "5px", border: "1px solid #ddd", borderRadius: "4px" }}
                />
              </div>
            </div>

            <div style={{ margin: "20px 0", borderTop: "1px solid #e0e0e0" }} />

            {/* Review */}
            <div style={{ marginBottom: "25px" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Valoración
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedRatings.includes(rating)}
                      onChange={() => handleRatingChange(rating)}
                      style={{ marginRight: "8px" }}
                    />
                    <span style={{ color: "#ffc107", marginRight: "5px" }}>
                      {"★".repeat(rating)}
                    </span>
                    {rating} Estrella{rating !== 1 ? 's' : ''}
                  </label>
                ))}
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            {(selectedCategory !== "Todos" || selectedSubcategory !== "Todos" || sortOrder || priceRange.min || priceRange.max || selectedRatings.length > 0) && (
              <button 
                onClick={handleClearAllFilters}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginTop: "10px"
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Contenido principal */}
          <div style={{ flex: 1 }}>
            {/* Grid de productos */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
              gap: "20px" 
            }}>
              {filteredProducts.map((prod, index) => (
                <div 
                  key={prod.id} 
                  className="product-card"
                  style={{ 
                    position: "relative",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <IconButton
                    onClick={() => toggleFavorite(prod.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "transparent",
                      "&:hover": { bgcolor: "transparent" },
                      transition: "all 0.3s ease",
                      border: "none",
                      boxShadow: "none"
                    }}
                  >
                    {favoriteIds.includes(prod.id) ? (
                      <Favorite sx={{ 
                        color: "#ff4d94",
                        fontSize: "24px",
                        transition: "all 0.3s ease"
                      }} />
                    ) : (
                      <FavoriteBorder sx={{ 
                        color: "#ffffffff", 
                        fontSize: "24px",
                        transition: "all 0.3s ease"
                      }} />
                    )}
                  </IconButton>

                  <Link
                    to={`/${lang}/producto/${prod.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ 
                      height: "150px", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      marginBottom: "10px",
                      overflow: "hidden"
                    }}>
                      <img
                        src={prod.imagen_url || noImage}
                        alt={prod.nombre_producto}
                        onError={(e) => { e.currentTarget.src = noImage; }}
                        style={{ 
                          maxHeight: "100%", 
                          maxWidth: "100%",
                          objectFit: "contain"
                        }}
                      />
                    </div>
                    
                    <div className="product-info-container">
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }} className="product-rating">
                        <Rating
                          name={`product-rating-${prod.id}`}
                          value={productRatings[prod.id]?.avg || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                          sx={{ color: "#ffc107", marginRight: "5px" }}
                        />
                        <span style={{ fontSize: "14px", marginLeft: "4px" }} className="rating-value">
                          {productRatings[prod.id]?.avg ? productRatings[prod.id].avg.toFixed(1) : "0.0"}
                        </span>
                      </div>
                      
                      <h5 style={{ 
                        margin: "5px 0", 
                        fontSize: "16px",
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }} className="product-name">
                        {prod.nombre_producto}
                      </h5>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="product-prices">
                        <p style={{ 
                          margin: 0, 
                          fontWeight: "bold",
                          color: "#ff4d94"
                        }} className="product-price">
                          {formatCOP(prod.precio_producto)}
                        </p>
                        {prod.precio_original && prod.precio_original > prod.precio_producto && (
                          <p style={{ 
                            margin: 0, 
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "14px"
                          }} className="product-original-price">
                            {formatCOP(prod.precio_original)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ marginTop: "10px" }}>
                    <button 
                      onClick={() => addToCart(prod.id)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#ff4d94",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.3s ease"
                      }}
                      className="add-to-cart-btn"
                    >
                      {t('products.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>No se encontraron productos</p>
                <p style={{ fontSize: "14px" }}>
                  {selectedCategory !== "Todos" || selectedSubcategory !== "Todos" 
                    ? "No hay productos para los filtros seleccionados" 
                    : "Intenta con otros filtros o categorías"}
                </p>
                <button 
                  onClick={handleClearAllFilters}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ff4d94",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginTop: "10px"
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .product-card {
            min-width: 220px;
            max-width: 250px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
            border: 1px solid #e0e0e0;
            padding: 15px;
            position: relative;
            transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }
          .product-card:hover {
            box-shadow: 0 12px 35px rgba(0,0,0,0.15);
            border-color: #ff4d94;
            transform: translateY(-8px) scale(1.03);
            z-index: 2;
          }
          .product-info-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
          .product-card h5 {
            font-size: 16px;
            font-weight: bold;
            margin: 5px 0;
            transition: color 0.3s;
            overflow: hidden;
            textOverflow: ellipsis;
            white-space: nowrap;
          }
          .product-card:hover h5 {
            color: #ff4d94;
          }
          .product-card .product-price {
            margin: 0;
            font-weight: bold;
            color: #ff4d94;
            font-size: 15px;
            transition: color 0.3s, transform 0.3s;
          }
          .product-card:hover .product-price {
            color: #ff2d7a;
            transform: scale(1.05);
          }
          .product-card .product-original-price {
            margin: 0;
            text-decoration: line-through;
            color: #999;
            font-size: 14px;
            transition: color 0.3s, transform 0.3s;
          }
          .product-card:hover .product-original-price {
            color: #777;
            transform: scale(1.05);
          }
          .add-to-cart-btn {
            width: 100%;
            padding: 8px;
            background-color: #ff4d94;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
          }
          .product-card:hover .add-to-cart-btn {
            background-color: #ff2d7a !important;
            box-shadow: 0 6px 20px rgba(255, 77, 148, 0.4);
            transform: translateY(-3px);
          }
          .add-to-cart-btn:hover {
            background-color: #ff1a6d !important;
            transform: translateY(-3px) scale(1.05) !important;
            box-shadow: 0 8px 25px rgba(255, 77, 148, 0.5) !important;
          }
        `}
      </style>
    </section>
  );
}

export default ProductosCliente;