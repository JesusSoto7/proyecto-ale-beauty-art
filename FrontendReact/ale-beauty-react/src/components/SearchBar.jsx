import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
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
      setResults(filterAndLimit(arr, q));
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
            p: 2,
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
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const price = prod?.precio_producto || prod?.price || null;
                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        p: 1,
                        textAlign: "center",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: 4,
                          borderColor: pinkTheme.primary,
                        },
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            bgcolor: "#eee",
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontWeight: 500 }}
                      >
                        {name}
                      </Typography>
                      {price && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: pinkTheme.primary,
                            fontWeight: "bold",
                          }}
                        >
                          {formatCOP(price)}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* 📱 Móvil */}
              <Box
                sx={{
                  display: { xs: "flex", sm: "none" },
                  overflowX: "auto",
                  gap: 2,
                  pb: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {results.map((prod) => {
                  const name =
                    prod?.nombre_producto || prod?.name || t("header.noName");
                  const img = prod?.imagen_url || prod?.image || null;
                  const price = prod?.precio_producto || prod?.price || null;
                  return (
                    <Box
                      key={prod.id || prod.slug || name}
                      onClick={() => goToProduct(prod)}
                      sx={{
                        minWidth: 160,
                        maxWidth: 200,
                        p: 1,
                        textAlign: "center",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        cursor: "pointer",
                        flexShrink: 0,
                        "&:hover": {
                          boxShadow: 4,
                          borderColor: pinkTheme.primary,
                        },
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            bgcolor: "#eee",
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontWeight: 500 }}
                      >
                        {name}
                      </Typography>
                      {price && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: pinkTheme.primary,
                            fontWeight: "bold",
                          }}
                        >
                          {formatCOP(price)}
                        </Typography>
                      )}
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
