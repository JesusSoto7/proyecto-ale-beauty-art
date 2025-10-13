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
import Rating from "@mui/material/Rating";
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";
import noImage from "../../assets/images/no_image.png";
import { useOutletContext } from "react-router-dom";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [subcategories, setSubcategories] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Todos");
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null); // ⬅️ asc | desc
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [productRatings, setProductRatings] = useState({}); // { [productId]: { avg, count } }
  const [selectedRatings, setSelectedRatings] = useState([]);

  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    // Cargar productos, categorías, subcategorías, carrito y favoritos
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

        // Verificar que las respuestas sean exitosas
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
        const normalized = arr.map(c => ({
          id: c.id_categoria || c.id,
          nombre: c.nombre_categoria || c.nombre,
          sub_categories: Array.isArray(c.sub_categories) ? c.sub_categories.map(sc => ({
            id: sc.id_subcategoria || sc.id,
            nombre: sc.nombre_subcategoria || sc.nombre,
            categoria_id: sc.categoria_id || c.id
          })) : []
        }));
        setCategories(normalized);
        setCart(cartData.cart);

        // Extraer todas las subcategorías de las categorías
        const allSubcategories = [];
        normalized.forEach(category => {
          if (Array.isArray(category.sub_categories)) {
            allSubcategories.push(...category.sub_categories);
          }
        });
        setSubcategories(allSubcategories);

        // --- Cargar ratings de cada producto ---
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

      } catch (err) {
        console.error("Error cargando datos", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  // Filtrar subcategorías según la categoría seleccionada
  const filteredSubcategories = selectedCategory === "Todos" 
    ? subcategories 
    : subcategories.filter(sc => String(sc.categoria_id) === String(selectedCategory));

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
  let filteredProducts = products;

  // Filtro por subcategoría (tiene prioridad sobre categoría)
  if (selectedSubcategory !== "Todos") {
    filteredProducts = filteredProducts.filter(p => {
      const subcatId = p.subcategoria_id || p.subcategory_id;
      return String(subcatId) === String(selectedSubcategory);
    });
  }
  // Filtro por categoría (solo si no hay subcategoría seleccionada)
  else if (selectedCategory !== "Todos") {
    filteredProducts = filteredProducts.filter(p => {
      // Buscar la subcategoría del producto
      const productSubcategory = subcategories.find(sc => 
        String(sc.id) === String(p.subcategoria_id || p.subcategory_id)
      );
      // Si el producto tiene subcategoría y esta pertenece a la categoría seleccionada
      return productSubcategory && String(productSubcategory.categoria_id) === String(selectedCategory);
    });
  }

  // Filtro por rango de precio
  if (priceRange.min || priceRange.max) {
    filteredProducts = filteredProducts.filter(p => {
      const price = p.precio_producto;
      return (
        (priceRange.min === "" || price >= parseFloat(priceRange.min)) &&
        (priceRange.max === "" || price <= parseFloat(priceRange.max))
      );
    });
  }

  // Filtro por rating
  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productRating = Math.floor(productRatings[p.id]?.avg || 0);
      return selectedRatings.includes(productRating);
    });
  }

  // Ordenar
  if (sortOrder === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.precio_producto - b.precio_producto);
  } else if (sortOrder === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.precio_producto - a.precio_producto);
  }

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory("Todos"); // Resetear subcategoría cuando cambia la categoría
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

          // Disparar evento para actualizar el Header
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

  return (
    <section style={{marginTop: "90px", padding: "20px"}}>
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
        </p>
      </div>
      <div style={{ display: "flex", gap: "30px" }}>
        {/* Sidebar de filtros - Estructura como la imagen */}
        <div style={{ width: "250px", flexShrink: 0 }}>
          <Typography variant="h6" style={{ marginBottom: "15px", fontWeight: "bold" }}>
            Filter Options
          </Typography>

          {/* By Categories */}
          <div style={{ marginBottom: "25px" }}>
            <Typography variant="subtitle1" style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Categorías
            </Typography>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "Todos" && selectedSubcategory === "Todos"}
                  onChange={handleClearAllFilters}
                  style={{ marginRight: "8px" }}
                />
                Todos
              </label>
              {categories.map(cat => (
                <div key={cat.id}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="category"
                      checked={String(cat.id) === String(selectedCategory) && selectedSubcategory === "Todos"}
                      onChange={() => handleSelectCategory(cat.id)}
                      style={{ marginRight: "8px" }}
                    />
                    {cat.nombre}
                  </label>
                  
                  {/* Mostrar subcategorías si esta categoría está seleccionada */}
                  {String(cat.id) === String(selectedCategory) && cat.sub_categories && cat.sub_categories.length > 0 && (
                    <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                      {cat.sub_categories.map(sub => (
                        <label key={sub.id} style={{ display: "flex", alignItems: "center", cursor: "pointer", marginBottom: "3px" }}>
                          <input
                            type="radio"
                            name="subcategory"
                            checked={String(sub.id) === String(selectedSubcategory)}
                            onChange={() => handleSelectSubcategory(sub.id)}
                            style={{ marginRight: "8px" }}
                          />
                          {sub.nombre}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              Price
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
              Review
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
                  {rating} Star
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
          {/* Encabezado con resultados */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            
            {/* Filtros activos */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {selectedCategory !== "Todos" && (
                <div style={{ 
                  backgroundColor: "#f5f5f5", 
                  padding: "5px 10px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  Categoría: {categories.find(c => String(c.id) === String(selectedCategory))?.nombre}
                </div>
              )}
              
              {selectedSubcategory !== "Todos" && (
                <div style={{ 
                  backgroundColor: "#f5f5f5", 
                  padding: "5px 10px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  Subcategoría: {subcategories.find(sc => String(sc.id) === String(selectedSubcategory))?.nombre}
                </div>
              )}
              
              {sortOrder && (
                <div style={{ 
                  backgroundColor: "#f5f5f5", 
                  padding: "5px 10px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  Orden: {sortOrder === "asc" ? "Menor a mayor" : "Mayor a menor"}
                </div>
              )}
              
              {(priceRange.min || priceRange.max) && (
                <div style={{ 
                  backgroundColor: "#f5f5f5", 
                  padding: "5px 10px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  Precio: ${priceRange.min || "10.00"} - ${priceRange.max || "100.00"}
                </div>
              )}
              
              {selectedRatings.length > 0 && (
                <div style={{ 
                  backgroundColor: "#f5f5f5", 
                  padding: "5px 10px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  Rating: {selectedRatings.map(r => `${r}★`).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Grid de productos - Estilo como la imagen */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "20px" 
          }}>
            {filteredProducts.map((prod) => (
              <div 
                key={prod.id} 
                style={{ 
                  position: "relative",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
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
                    <Favorite sx={{ color: "#ff4d94" }} />
                  ) : (
                    <FavoriteBorder sx={{ color: "#666" }} />
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
                  
                  {/* Rating */}
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                    <Rating
                      name={`product-rating-${prod.id}`}
                      value={productRatings[prod.id]?.avg || 0}
                      precision={0.5}
                      readOnly
                      size="small"
                      sx={{ color: "#ffc107", marginRight: "5px" }}
                    />
                    <span style={{ fontSize: "14px", marginLeft: "4px" }}>
                      {productRatings[prod.id]?.avg ? productRatings[prod.id].avg.toFixed(1) : "0.0"}
                    </span>
                  </div>
                  
                  {/* Nombre del producto */}
                  <h5 style={{ 
                    margin: "5px 0", 
                    fontSize: "16px",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {prod.nombre_producto}
                  </h5>
                  
                  {/* Precio */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: "bold",
                      color: "#ff4d94"
                    }}>
                      {formatCOP(prod.precio_producto)}
                    </p>
                    {prod.precio_original && prod.precio_original > prod.precio_producto && (
                      <p style={{ 
                        margin: 0, 
                        textDecoration: "line-through",
                        color: "#999",
                        fontSize: "14px"
                      }}>
                        {formatCOP(prod.precio_original)}
                      </p>
                    )}
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
                      fontSize: "14px"
                    }}
                  >
                    {t('products.addToCart')}
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

export default ProductosCliente;