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

  const filterAndLimit = (arr, q) => {
    const query = q.toLowerCase();
    return arr
      .filter((p) =>
        (p.nombre_producto || p.name || "").toLowerCase().includes(query)
      )
      .slice(0, 8);
  };

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
      if (filteredResults.length > 0) {
        await loadProductRatings(filteredResults);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

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

  const goToProduct = (prod) => {
    setSearchTerm("");
    setResults([]);
    navigate(`/${lang}/producto/${prod.slug || prod.id}`);
  };

  const handleSearchSubmit = (e) => e.preventDefault();

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

      {/* 🔽 Dropdown resultados - CORREGIDO */}
      {(results.length > 0 || loading) && (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mt: 1,
            bgcolor: "white",
            boxShadow: 3,
            borderRadius: 2,
            zIndex: 1300,
            width: "90vw",
            maxWidth: {
              xs: "95vw",
              sm: "600px",
              md: "800px",
              lg: "1000px"
            },
            p: 1.5,
            maxHeight: "70vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#555",
              },
            },
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
                    sm: "repeat(auto-fill, minmax(140px, 1fr))",
                    md: "repeat(auto-fill, minmax(160px, 1fr))",
                    lg: "repeat(auto-fill, minmax(180px, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const priceOriginal = prod?.precio_producto || prod?.price || null;
                  const priceDiscount = prod?.precio_con_mejor_descuento;
                  const rating = productRatings[prod.id]?.avg || 0;

                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        p: 0.75,
                        textAlign: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: pinkTheme.primary,
                          transform: "translateY(-2px)",
                        },
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: "240px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Contenedor de imagen - CORREGIDO */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 0,
                          paddingBottom: "100%",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 1,
                          mb: 0.75,
                          bgcolor: "#f8f8f8",
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
                              objectFit: "cover", // ✅ CAMBIADO DE "contain" A "cover"
                              objectPosition: "center",
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              fontSize: "10px",
                            }}
                          >
                            {t("header.noImage")}
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        flex: 1, 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "space-between",
                        gap: 0.5,
                      }}>
                        <Box style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
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
                              fontSize: "0.9rem"
                            }}
                          />
                          <span style={{ 
                            fontSize: "11px",
                            marginLeft: "3px",
                            color: "#666"
                          }}>
                            {rating ? rating.toFixed(1) : "0.0"}
                          </span>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontWeight: 500,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                            textAlign: "center",
                            minHeight: "28px"
                          }}
                        >
                          {name}
                        </Typography>
                        {(priceOriginal !== null) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: priceDiscount && priceDiscount < priceOriginal ? "#dc2626" : pinkTheme.primary,
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                              textAlign: "center"
                            }}
                          >
                            {priceDiscount && priceDiscount < priceOriginal ? (
                              <>
                                {formatCOP(priceDiscount)}
                                <span style={{
                                  textDecoration: "line-through",
                                  color: "#64748b",
                                  marginLeft: "0.5em",
                                  fontWeight: "normal",
                                  fontSize: "0.9em"
                                }}>
                                  {formatCOP(priceOriginal)}
                                </span>
                              </>
                            ) : (
                              formatCOP(priceOriginal)
                            )}
                          </Typography>
                        )}
                        {prod.mejor_descuento_para_precio && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#2563eb",
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              textAlign: "center",
                            }}
                          >
                            {prod.mejor_descuento_para_precio.tipo === "porcentaje"
                              ? `${prod.mejor_descuento_para_precio.valor}% OFF`
                              : `-${formatCOP(prod.mejor_descuento_para_precio.valor)}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* 📱 Móvil - CORREGIDO */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  overflowX: "auto",
                  gap: 1.5,
                  pb: 1,
                  "&::-webkit-scrollbar": { 
                    height: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "3px",
                  },
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const priceOriginal = prod?.precio_producto || prod?.price || null;
                  const priceDiscount = prod?.precio_con_mejor_descuento;
                  const rating = productRatings[prod.id]?.avg || 0;

                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        minWidth: 130,
                        maxWidth: 140,
                        p: 0.75,
                        textAlign: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1.5,
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "220px",
                        overflow: "hidden",
                      }}
                    >
                      {/* Contenedor de imagen móvil - CORREGIDO */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 0,
                          paddingBottom: "100%",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: "#f8f8f8",
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
                              objectFit: "cover", // ✅ CAMBIADO DE "contain" A "cover"
                              objectPosition: "center",
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                              fontSize: "8px",
                              padding: 0.5,
                            }}
                          >
                            {t("header.noImage")}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ 
                        flex: 1, 
                        display: "flex", 
                        flexDirection: "column",
                        gap: 0.25,
                      }}>
                        <Box style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
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
                              fontSize: "0.7rem"
                            }}
                          />
                          <span style={{ 
                            fontSize: "9px",
                            marginLeft: "2px",
                            color: "#666"
                          }}>
                            {rating ? rating.toFixed(1) : "0.0"}
                          </span>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontWeight: 500,
                            fontSize: "0.7rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.1,
                            textAlign: "center",
                            minHeight: "24px"
                          }}
                        >
                          {name}
                        </Typography>
                        {(priceOriginal !== null) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: priceDiscount && priceDiscount < priceOriginal ? "#dc2626" : pinkTheme.primary,
                              fontWeight: "bold",
                              fontSize: "0.7rem",
                              textAlign: "center"
                            }}
                          >
                            {priceDiscount && priceDiscount < priceOriginal ? (
                              <>
                                {formatCOP(priceDiscount)}
                                <span style={{
                                  textDecoration: "line-through",
                                  color: "#64748b",
                                  marginLeft: "0.4em",
                                  fontWeight: "normal",
                                  fontSize: "0.85em"
                                }}>
                                  {formatCOP(priceOriginal)}
                                </span>
                              </>
                            ) : (
                              formatCOP(priceOriginal)
                            )}
                          </Typography>
                        )}
                        {prod.mejor_descuento_para_precio && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#2563eb",
                              fontWeight: 500,
                              fontSize: "0.65rem",
                              textAlign: "center",
                            }}
                          >
                            {prod.mejor_descuento_para_precio.tipo === "porcentaje"
                              ? `${prod.mejor_descuento_para_precio.valor}% OFF`
                              : `-${formatCOP(prod.mejor_descuento_para_precio.valor)}`}
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