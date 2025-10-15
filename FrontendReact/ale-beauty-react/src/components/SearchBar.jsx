import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Rating } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import { formatCOP } from "../services/currency";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const DEBOUNCE_MS = 400;

const pinkTheme = {
  primary: "#e91e63",
  secondary: "#f8bbd0",
  dark: "#ad1457",
  light: "#fce4ec",
  background: "#fff5f7",
};

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  border: "1px solid #ccc",
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(2),
  transition: "all 0.3s ease",
  width: "160px",
  [theme.breakpoints.up("sm")]: {
    width: "200px",
  },
  "&:focus-within": {
    width: "260px",
    [theme.breakpoints.up("sm")]: {
      width: "320px",
    },
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create(["width", "padding"], {
      duration: theme.transitions.duration.short,
    }),
    width: "100%",
  },
}));

export default function SearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productRatings, setProductRatings] = useState({});
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // 🔹 Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setResults([]);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setResults([]);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🔹 Filtro local de productos
  const filterAndLimit = (arr, q) => {
    const query = q.toLowerCase();
    return arr
      .filter((p) =>
        (p.nombre_producto || p.name || "").toLowerCase().includes(query)
      )
      .slice(0, 8);
  };

  // 🔹 Cargar ratings de productos (EXACTAMENTE IGUAL QUE EN INICIO)
  const loadProductRatings = async (productList) => {
    const ratingsObj = {};
    const token = localStorage.getItem('token');
    
    await Promise.all(productList.map(async (product) => {
      try {
        const res = await fetch(`https://localhost:4000/api/v1/products/${product.slug}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reviews = await res.json();
        if (Array.isArray(reviews) && reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          ratingsObj[product.id] = { 
            avg, 
            count: reviews.length 
          };
        } else {
          ratingsObj[product.id] = { avg: 0, count: 0 };
        }
      } catch (error) {
        console.error(`Error cargando rating para producto ${product.id}:`, error);
        ratingsObj[product.id] = { avg: 0, count: 0 };
      }
    }));
    
    setProductRatings(ratingsObj);
  };

  // 🔹 Buscar productos
  async function fetchResults(q) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:4000/api/v1/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setResults([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];
      const filteredResults = filterAndLimit(arr, q);
      setResults(filteredResults);
      
      // Cargar ratings para los productos filtrados (EXACTAMENTE IGUAL QUE EN INICIO)
      if (filteredResults.length > 0) {
        await loadProductRatings(filteredResults);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Controlar búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchTerm.trim() === "") {
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(searchTerm);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // 🔹 Navegar al producto
  const goToProduct = (prod) => {
    setSearchTerm("");
    setResults([]);
    navigate(`/${lang}/producto/${prod.slug || prod.id}`);
  };

  const handleSearchSubmit = (e) => e.preventDefault();

  // 🔹 Render
  return (
    <Box
      component="form"
      onSubmit={handleSearchSubmit}
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
      ref={containerRef}
    >
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder={t("header.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Search>

      {/* 🔽 Dropdown resultados */}
      {(results.length > 0 || loading) && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: 1,
            bgcolor: "white",
            boxShadow: 3,
            borderRadius: 2,
            zIndex: 1300,
            width: "90%",
            mx: "auto",
            p: 1.5, // Reducido el padding del contenedor principal
          }}
        >
          {loading && <Box sx={{ p: 1 }}>{t("header.searching")}</Box>}

          {!loading && results.length > 0 && (
            <>
              {/* 💻 Escritorio */}
              <Box
                sx={{
                  display: { xs: "none", sm: "grid" },
                  gridTemplateColumns: {
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                    lg: "repeat(5, 1fr)",
                  },
                  gap: 1.5, // Reducido el gap entre tarjetas
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const price = prod?.precio_producto || prod?.price || null;
                  const rating = productRatings[prod.id]?.avg || 0;

                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        p: 0.75, // Padding reducido
                        textAlign: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: pinkTheme.primary,
                        },
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: "180px", // Altura mínima reducida
                      }}
                    >
                      {/* Contenedor de imagen más pequeño pero manteniendo relación 1:1 */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 0,
                          paddingBottom: "80%", // Imagen más pequeña pero manteniendo proporción
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 1,
                          mb: 0.75, // Margen inferior reducido
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={name}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "contain", // Mantener imagen completa
                              backgroundColor: "#f8f8f8", // Fondo más claro
                            }}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWMTQwSDgwVjYwWiIgZmlsbD0iI0RBREZEOSIvPgo8L3N2Zz4K";
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "#f8f8f8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              fontSize: "10px", // Fuente más pequeña
                            }}
                          >
                            {t("header.noImage")}
                          </Box>
                        )}
                      </Box>
                      
                      {/* Contenido textual compacto */}
                      <Box sx={{ 
                        flex: 1, 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        minHeight: "60px" // Altura mínima para contenido
                      }}>
                        {/* Rating de estrellas más compacto */}
                        <Box style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          marginBottom: "3px",
                          width: "100%"
                        }}>
                          <Rating
                            name={`product-rating-${prod.id}`}
                            value={rating}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ 
                              color: "#ffc107",
                              fontSize: "0.9rem" // Estrellas más pequeñas
                            }}
                          />
                          <span style={{ 
                            fontSize: "11px", // Texto más pequeño
                            marginLeft: "3px",
                            color: "#666"
                          }}>
                            {rating ? rating.toFixed(1) : "0.0"}
                          </span>
                        </Box>

                        {/* Nombre del producto más compacto */}
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontWeight: 500,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "0.75rem", // Texto más pequeño
                            lineHeight: 1.2,
                            mb: 0.25,
                            textAlign: "center",
                            minHeight: "28px"
                          }}
                        >
                          {name}
                        </Typography>
                        
                        {/* Precio más compacto */}
                        {price && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: pinkTheme.primary,
                              fontWeight: "bold",
                              fontSize: "0.8rem", // Texto más pequeño
                              textAlign: "center"
                            }}
                          >
                            {formatCOP(price)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* 📱 Móvil - Tarjetas aún más compactas */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  overflowX: "auto",
                  gap: 1.5,
                  pb: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const price = prod?.precio_producto || prod?.price || null;
                  const rating = productRatings[prod.id]?.avg || 0;

                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        minWidth: 120, // Ancho mínimo reducido
                        maxWidth: 130,
                        p: 0.75, // Padding reducido
                        textAlign: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        height: "auto",
                      }}
                    >
                      {/* Contenedor de imagen móvil más pequeño */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 0,
                          paddingBottom: "80%", // Imagen más compacta
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 1,
                          mb: 0.5,
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={name}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              backgroundColor: "#f8f8f8",
                            }}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWMTQwSDgwVjYwWiIgZmlsbD0iI0RBREZEOSIvPgo8L3N2Zz4K";
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              bgcolor: "#f8f8f8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              fontSize: "8px", // Fuente más pequeña en móvil
                              padding: 0.5,
                            }}
                          >
                            {t("header.noImage")}
                          </Box>
                        )}
                      </Box>
                      
                      {/* Contenido móvil ultra compacto */}
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        {/* Rating móvil compacto */}
                        <Box style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          marginBottom: "2px",
                          width: "100%"
                        }}>
                          <Rating
                            name={`product-rating-${prod.id}`}
                            value={rating}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ 
                              color: "#ffc107",
                              fontSize: "0.7rem" // Estrellas más pequeñas en móvil
                            }}
                          />
                          <span style={{ 
                            fontSize: "9px", // Texto más pequeño en móvil
                            marginLeft: "2px",
                            color: "#666"
                          }}>
                            {rating ? rating.toFixed(1) : "0.0"}
                          </span>
                        </Box>

                        {/* Nombre móvil compacto */}
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: "0.7rem", // Texto más pequeño
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.1,
                            mb: 0.25,
                            textAlign: "center",
                            minHeight: "24px"
                          }}
                        >
                          {name}
                        </Typography>
                        
                        {/* Precio móvil compacto */}
                        {price && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: pinkTheme.primary,
                              fontWeight: "bold",
                              fontSize: "0.65rem", // Texto más pequeño
                              textAlign: "center"
                            }}
                          >
                            {formatCOP(price)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}