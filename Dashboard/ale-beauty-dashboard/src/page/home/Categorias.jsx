import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
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
  Chip,
  Avatar,
  Fade,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import ImageIcon from "@mui/icons-material/Image";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import '../../assets/stylesheets/categoriasHome.css';

const Categorias = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { slug } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const token = localStorage.getItem("token");

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("https://localhost:4000/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error cargando categorías", err);
        showSnackbar("Error al cargar categorías", "error");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const openDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaEdit(categoria);
      setNombre(categoria.nombre_categoria);
      setImagenPreview(categoria.imagen_url);
    } else {
      setCategoriaEdit(null);
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
    if (!categoriaEdit && !imagen) newErrors.imagen = "La imagen es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Activa el estado de carga
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append("category[nombre_categoria]", nombre);
    if (imagen) formData.append("category[imagen]", imagen);

    try {
      let url = "https://localhost:4000/api/v1/categories";
      let method = "POST";

      if (categoriaEdit) {
        url += `/${categoriaEdit.id}`;
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
        setSubmitLoading(false); // Desactivar la carga en caso de error
        return;
      }

      // Una vez creada o actualizada, recarga las categorías del backend
      showSnackbar("Procesando cambios, un momento...", "success");
      setTimeout(async () => {
        try {
          const categoriasRes = await fetch("https://localhost:4000/api/v1/categories", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const categoriasData = await categoriasRes.json();
          setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
          showSnackbar(categoriaEdit ? "Categoría actualizada y cargada correctamente" : "Categoría creada y cargada correctamente", "success");
        } catch (fetchError) {
          console.error("Error actualizando categorías desde el servidor tras crear/editar:", fetchError);
          showSnackbar("Error actualizando la vista tras crear la categoría", "error");
        }
      }, 1200);

      setNombre("");
      setImagen(null);
      setImagenPreview(null);
      setCategoriaEdit(null);
      setOpen(false);
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Ocurrió un error procesando la categoría", "error");
    } finally {
      // Desactiva la carga al final del proceso
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const res = await fetch(`https://localhost:4000/api/v1/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        showSnackbar(`Error: ${errorData.error || res.statusText}`, "error");
        return;
      }

      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
      showSnackbar("Categoría eliminada correctamente", "success");
    } catch (err) {
      console.error("Error:", err);
      showSnackbar("Ocurrió un error eliminando la categoría", "error");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: "background.paper"
      }}
    >
      <Box sx={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, #f5bbe8ff 0%, #b671b6ff 100%)",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                }}
              >
                <CategoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #ee90c4ff 0%, #e98db0ff 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Gestión de Categorías
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? "#9ca3af" : "#6b7280",
                    fontSize: "1em",
                  }}
                >
                  Administra las categorías de productos
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog()}
              sx={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #df5f94ff 0%, #f7c9e9ff 100%)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1em",
                px: 3,
                py: 1.2,
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Nueva Categoría
            </Button>
          </Box>
        </Box>

        {/* Grid de Categorías */}
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
                    : "0 4px 20px rgba(37, 99, 235, 0.08)",
                }}
              >
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
              </Card>
            ))
          ) : categorias.length === 0 ? (
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
              <Typography variant="h6" sx={{ mb: 1, fontSize: "1.2rem" }}>
                No hay categorías todavía
              </Typography>
              <Typography variant="body2" >
                Crea tu primera categoría para comenzar
              </Typography>
            </Box>
          ) : (
            categorias.map((cat, index) => (
              <Fade in key={cat.id} timeout={300 + index * 100}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: isDark
                      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                      : "0 4px 20px rgba(37, 99, 235, 0.08)",
                    border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
                    backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: isDark
                        ? "0 12px 40px rgba(0, 0, 0, 0.5)"
                        : "0 12px 40px rgba(37, 99, 235, 0.15)",
                    },
                  }}
                  onClick={() => navigate(`/es/home/categories/${cat.slug}`)}
                >
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        cat.imagen_url ||
                        "https://via.placeholder.com/300x200?text=Sin+imagen"
                      }
                      alt={cat.nombre_categoria}
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
                        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)",
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1em",
                          flex: 1,
                        }}
                      >
                        {cat.nombre_categoria}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                        fontSize: "0.85em",
                      }}
                    >
                      {cat.sub_categories?.length || 0} subcategorías disponibles
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
                    <Tooltip title="Editar categoría">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDialog(cat);
                        }}
                        sx={{
                          color: "#2563eb",
                          border: "1px solid #2563eb",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "#dbeafe",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar categoría">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(cat.id);
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
            sx: {
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0, 81, 255, 0.15)",
              background: "background.paper"
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: "1.4em",
              color: isDark ? "#fff" : "#1f2937",
              pb: 2,
              pt: 3,
              px: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: `3px solid ${categoriaEdit ? "#f59e0b" : "#2563eb"}`,
            }}
          >
            {categoriaEdit ? <EditIcon sx={{ color: "#f59e0b" }} /> : <AddIcon sx={{ color: "#2563eb" }} />}
            {categoriaEdit ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <br></br>
          <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
            <Stack spacing={3}>
              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: "10px" }}>
                  {errors.submit}
                </Alert>
              )}

              <TextField
                label="Nombre de la Categoría"
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
                InputLabelProps={{
                  shrink: true,
                  style: {
                    backgroundColor: "background.paper",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    backgroundColor: isDark ? "#1a1a2e" : "#fff",
                    px: 0.5,
                    fontWeight: 600,
                    fontSize: "0.95em",
                    "&.Mui-focused": {
                      color: "#2563eb",
                    },
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "translate(14px, -9px) scale(0.75)",
                  },
                }}
              />

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
                  Imagen de la Categoría {!categoriaEdit && <span style={{ color: "#dc2626" }}>*</span>}
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
                    borderColor: errors.imagen ? "#d32f2f" : "#e0e7ff",
                    color: errors.imagen ? "#d32f2f" : "#2563eb",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#f0f4ff",
                      borderColor: errors.imagen ? "#d32f2f" : "#2563eb",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {imagen ? imagen.name : categoriaEdit ? "Cambiar imagen" : "Seleccionar imagen"}
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
                            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <ImageIcon sx={{ color: "#fff", fontSize: 18 }} />
                          <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>
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

          <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: `1px solid ${isDark ? "#374151" : "#f0f0f0"}` }}>
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
              disabled={submitLoading} // Desactiva el botón mientras se está cargando
              variant="contained"
              sx={{
                borderRadius: "8px",
                background: categoriaEdit
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1,
                boxShadow: categoriaEdit
                  ? "0 4px 12px rgba(245, 158, 11, 0.3)"
                  : "0 4px 12px rgba(37, 99, 235, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: categoriaEdit
                    ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                    : "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                  boxShadow: categoriaEdit
                    ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                    : "0 6px 20px rgba(37, 99, 235, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {submitLoading ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                  <span>Cargando...</span>
                </Stack>
              ) : (
                categoriaEdit ? "Actualizar" : "Crear"
              )}
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
              border: `1px solid ${snackbar.severity === "success" ? "#86efac" : "#fca5a5"
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

export default Categorias;