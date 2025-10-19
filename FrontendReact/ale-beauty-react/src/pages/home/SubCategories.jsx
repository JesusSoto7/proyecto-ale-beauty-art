import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Skeleton,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Fade,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import ImageIcon from "@mui/icons-material/Image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const SubCategorias = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { slug } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [subCategorias, setSubCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subCategoriaEdit, setSubCategoriaEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [categoryName, setCategoryName] = useState("");

  const token = localStorage.getItem("token");

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    
    // Cargar nombre de categoría
    fetch(`https://localhost:4000/api/v1/categories/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategoryName(data.nombre_categoria))
      .catch((err) => console.error("Error cargando categoría", err));

    // Cargar subcategorías
    fetch(`https://localhost:4000/api/v1/categories/${slug}/sub_categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubCategorias(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error cargando subcategorías", err);
        showSnackbar("Error al cargar subcategorías", "error");
      })
      .finally(() => setLoading(false));
  }, [token, slug]);

  const openDialog = (sub_category = null) => {
    if (sub_category) {
      setSubCategoriaEdit(sub_category);
      setNombre(sub_category.nombre);
      setImagenPreview(sub_category.imagen_url);
    } else {
      setSubCategoriaEdit(null);
      setNombre("");
      setImagen(null);
      setImagenPreview(null);
    }
    setErrors({});
    setOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!subCategoriaEdit && !imagen) newErrors.imagen = "La imagen es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("sub_category[nombre]", nombre);
    if (imagen) formData.append("sub_category[imagen]", imagen);

    try {
      let url = `https://localhost:4000/api/v1/categories/${slug}/sub_categories`;
      let method = "POST";

      if (subCategoriaEdit) {
        url += `/${subCategoriaEdit.id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        showSnackbar(`Error: ${errorData.error || res.statusText}`, "error");
        return;
      }

      const subCategoriaActualizada = await res.json();

      if (subCategoriaEdit) {
        setSubCategorias((prev) =>
          prev.map((cat) =>
            cat.id === subCategoriaActualizada.id ? subCategoriaActualizada : cat
          )
        );
        showSnackbar("Subcategoría actualizada correctamente", "success");
      } else {
        setSubCategorias((prev) => [...prev, subCategoriaActualizada]);
        showSnackbar("Subcategoría creada correctamente", "success");
      }

      setNombre("");
      setImagen(null);
      setImagenPreview(null);
      setSubCategoriaEdit(null);
      setOpen(false);
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Ocurrió un error procesando la subcategoría", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta subcategoría?"))
      return;

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/categories/${slug}/sub_categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showSnackbar(`Error: ${errorData.error || res.statusText}`, "error");
        return;
      }

      setSubCategorias((prev) => prev.filter((sc) => sc.id !== id));
      showSnackbar("Subcategoría eliminada correctamente", "success");
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Ocurrió un error eliminando la subcategoría", "error");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)"
          : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 2,
              color: isDark ? "#9ca3af" : "#6b7280",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                color: "#2563eb",
              },
            }}
          >
            Volver a Categorías
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <CategoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Subcategorías
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? "#9ca3af" : "#6b7280",
                    fontSize: "1em",
                  }}
                >
                  {categoryName || "Cargando..."}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog()}
              sx={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1em",
                px: 3,
                py: 1.2,
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Nueva Subcategoría
            </Button>
          </Box>
        </Box>

        {/* Grid de Subcategorías */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((skeleton) => (
              <Card
                key={skeleton}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: isDark
                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(16, 185, 129, 0.08)",
                }}
              >
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
              </Card>
            ))
          ) : subCategorias.length === 0 ? (
            <Box
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                color: "#999",
              }}
            >
              <CategoryIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
              <Typography
                variant="h6"
                sx={{ mb: 1, fontSize: "1.2rem", color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                No hay subcategorías todavía
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? "#6b7280" : "#9ca3af" }}>
                Crea tu primera subcategoría para comenzar
              </Typography>
            </Box>
          ) : (
            subCategorias.map((sc, index) => (
              <Fade in key={sc.id} timeout={300 + index * 100}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(16, 185, 129, 0.08)",
                    border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                    backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: isDark
                        ? "0 12px 40px rgba(0, 0, 0, 0.5)"
                        : "0 12px 40px rgba(16, 185, 129, 0.15)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        sc.imagen_url ||
                        "https://via.placeholder.com/300x200?text=Sin+imagen"
                      }
                      alt={sc.nombre}
                      sx={{
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)",
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1em",
                        color: isDark ? "#fff" : "#1f2937",
                        mb: 0.5,
                      }}
                    >
                      {sc.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                        fontSize: "0.85em",
                      }}
                    >
                      {sc.category?.nombre_categoria || "Sin categoría"}
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      px: 2.5,
                      pb: 2,
                      pt: 0,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Tooltip title="Editar subcategoría">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDialog(sc);
                        }}
                        sx={{
                          color: "#10b981",
                          border: "1px solid #10b981",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "#d1fae5",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar subcategoría">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(sc.id);
                        }}
                        sx={{
                          color: "#dc2626",
                          border: "1px solid #dc2626",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "#fee2e2",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Fade>
            ))
          )}
        </Box>

        {/* Modal */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx:{
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(16, 185, 129, 0.15)",
              backgroundColor: isDark ? "#1a1a2e" : "#fff",
            },
          }}
        >
          <Box
            sx={{
              borderBottom: `3px solid ${subCategoriaEdit ? "#f59e0b" : "#10b981"}`,
              px: 3,
              pt: 3,
              pb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {subCategoriaEdit ? (
                <EditIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
              ) : (
                <AddIcon sx={{ color: "#10b981", fontSize: 28 }} />
              )}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.4em",
                  color: isDark ? "#fff" : "#1f2937",
                }}
              >
                {subCategoriaEdit ? "Editar Subcategoría" : "Nueva Subcategoría"}
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
            <Stack spacing={3}>
              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: "10px" }}>
                  {errors.submit}
                </Alert>
              )}

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "0.95em",
                  }}
                >
                  Nombre de la Subcategoría <span style={{ color: "#dc2626" }}>*</span>
                </Typography>
                <TextField
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors({ ...errors, nombre: undefined });
                  }}
                  fullWidth
                  autoFocus
                  required
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  placeholder="Ej: Laptops, Camisetas, Frutas..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: isDark ? "#0f0f1e" : "#f9fafb",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
                        backgroundColor: isDark ? "#1f2937" : "#fff",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                        backgroundColor: isDark ? "#1f2937" : "#fff",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      color: isDark ? "#fff" : "#1f2937",
                      fontSize: "1em",
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: errors.imagen ? "#d32f2f" : isDark ? "#d1d5db" : "#374151",
                    fontSize: "0.95em",
                  }}
                >
                  Imagen de la Subcategoría{" "}
                  {!subCategoriaEdit && <span style={{ color: "#dc2626" }}>*</span>}
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<ImageIcon />}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    py: 1.5,
                    borderColor: errors.imagen ? "#d32f2f" : "#d1fae5",
                    color: errors.imagen ? "#d32f2f" : "#10b981",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#d1fae5",
                      borderColor: errors.imagen ? "#d32f2f" : "#10b981",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {imagen
                    ? imagen.name
                    : subCategoriaEdit
                    ? "Cambiar imagen"
                    : "Seleccionar imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      handleImageChange(e);
                      if (errors.imagen) setErrors({ ...errors, imagen: undefined });
                    }}
                  />
                </Button>
                {errors.imagen && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d32f2f",
                      mt: 0.5,
                      display: "block",
                      fontSize: "0.8em",
                    }}
                  >
                    {errors.imagen}
                  </Typography>
                )}

                {imagenPreview && (
                  <Fade in>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: `2px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <img
                          src={imagenPreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            maxHeight: "220px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <ImageIcon sx={{ color: "#fff", fontSize: 18 }} />
                          <Typography
                            variant="caption"
                            sx={{ color: "#fff", fontWeight: 600 }}
                          >
                            Vista previa
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              p: 2.5,
              gap: 1.5,
              borderTop: `1px solid ${isDark ? "#374151" : "#f0f0f0"}`,
            }}
          >
            <Button
              onClick={() => setOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                borderColor: isDark ? "#4b5563" : "#d1d5db",
                color: isDark ? "#d1d5db" : "#374151",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: isDark ? "#6b7280" : "#9ca3af",
                  background: isDark ? "#1f2937" : "#f9fafb",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: "8px",
                background: subCategoriaEdit
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1,
                boxShadow: subCategoriaEdit
                  ? "0 4px 12px rgba(245, 158, 11, 0.3)"
                  : "0 4px 12px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: subCategoriaEdit
                    ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                    : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  boxShadow: subCategoriaEdit
                    ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                    : "0 6px 20px rgba(16, 185, 129, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {subCategoriaEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              fontWeight: 600,
              fontSize: "1em",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              borderRadius: "12px",
              border: `1px solid ${
                snackbar.severity === "success" ? "#86efac" : "#fca5a5"
              }`,
              background:
                snackbar.severity === "success"
                  ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                  : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color: snackbar.severity === "success" ? "#166534" : "#991b1b",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default SubCategorias;