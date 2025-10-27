import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import ImageUpload from "./ImageUpload";

const ProductModal = ({
  open,
  mode,
  product,
  onClose,
  onSubmit,
  categories,
  discounts,
  token,
  isDark,
}) => {
  const [formData, setFormData] = useState({
    nombre_producto: "",
    descripcion: "",
    precio_producto: "",
    stock: "",
    category_id: "",
    sub_category_id: "",
    discount_id: "",
    imagen: null,
    imagen_url: "",
  });

  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Ref para el textarea
  const textareaRef = useRef(null);

  // ✅ Auto-resize del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Resetear altura para calcular correctamente
      textarea.style.height = 'auto';
      // Calcular nueva altura basada en scrollHeight
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 100), 400);
      textarea.style.height = `${newHeight}px`;
    }
  }, [formData.descripcion]);

  // Resetear el formulario cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      const timeoutId = setTimeout(() => {
        resetForm();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  // Cargar datos del producto cuando se abre en modo edición
  useEffect(() => {
    if (open && mode === "edit" && product) {
      setFormData({
        nombre_producto: product.nombre_producto || "",
        descripcion: product.descripcion || "",
        precio_producto: product.precio_producto || "",
        stock: product.stock || "",
        category_id: product.sub_category?.category?.id || product.category_id || "",
        sub_category_id: product.sub_category_id || "",
        discount_id: product.discount_id || "",
        imagen: null,
        imagen_url: product.imagen_url || "",
      });

      if (product.sub_category?.category?.id || product.category_id) {
        loadSubCategories(product.sub_category?.category?.id || product.category_id);
      }
    } else if (open && mode === "create") {
      resetForm();
    }
  }, [open, mode, product]);

  const resetForm = useCallback(() => {
    setFormData({
      nombre_producto: "",
      descripcion: "",
      precio_producto: "",
      stock: "",
      category_id: "",
      sub_category_id: "",
      discount_id: "",
      imagen: null,
      imagen_url: "",
    });
    setSubCategories([]);
    setErrors({});
  }, []);

  const loadSubCategories = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }

      setLoadingSubCategories(true);
      try {
        const response = await fetch(
          `https://localhost:4000/api/v1/categories/${categoryId}/sub_categories`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await response.json();
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading subcategories:", error);
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    },
    [token]
  );

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === "category_id") {
      setFormData((prev) => ({ ...prev, sub_category_id: "" }));
      loadSubCategories(value);
    }
  };

  const handleImageChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      imagen: file,
      imagen_url: preview,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_producto.trim()) {
      newErrors.nombre_producto = "El nombre es obligatorio";
    }

    if (!formData.precio_producto || Number(formData.precio_producto) <= 0) {
      newErrors.precio_producto = "El precio debe ser mayor a 0";
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      newErrors.stock = "El stock no puede ser negativo";
    }

    if (!formData.sub_category_id) {
      newErrors.sub_category_id = "La subcategoría es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("product[nombre_producto]", formData.nombre_producto);
    formDataToSend.append("product[descripcion]", formData.descripcion);
    formDataToSend.append("product[precio_producto]", formData.precio_producto);
    formDataToSend.append("product[stock]", formData.stock);
    formDataToSend.append("product[sub_category_id]", formData.sub_category_id);

    if (formData.discount_id && formData.discount_id !== "") {
      formDataToSend.append("product[discount_id]", formData.discount_id);
    } else {
      formDataToSend.append("product[discount_id]", "");
    }

    if (formData.imagen instanceof File) {
      formDataToSend.append("product[imagen]", formData.imagen);
    }

    try {
      await onSubmit(formDataToSend, mode === "edit" ? product.slug : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const modalTitle = mode === "create" ? "Agregar Producto" : "Editar Producto";
  const modalColor = mode === "create" ? "#41218bff" : "#4245f5ff";

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          background: isDark ? "#1e1e2e" : "#ffffff",
          boxShadow: "0 20px 60px rgba(37, 99, 235, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: "1.5em",
          color: modalColor,
          borderBottom: `2px solid ${modalColor}`,
          pb: 2,
        }}
      >
        {modalTitle}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <ImageUpload
            currentImage={formData.imagen_url}
            onImageChange={handleImageChange}
            isDark={isDark}
          />

          <TextField
            label="Nombre del Producto"
            value={formData.nombre_producto}
            onChange={handleChange("nombre_producto")}
            error={!!errors.nombre_producto}
            helperText={errors.nombre_producto}
            fullWidth
            required
            autoComplete="off"
          />

          {/* ✅ TEXTAREA CON AUTO-RESIZE */}
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: isDark ? "#e0e0e0" : "#374151",
              }}
            >
              Descripción del Producto
            </Typography>
            <Box
              component="textarea"
              ref={textareaRef}
              placeholder="Escribe una descripción detallada del producto..."
              value={formData.descripcion}
              onChange={handleChange("descripcion")}
              sx={{
                width: "100%",
                minHeight: "100px",
                maxHeight: "400px",
                padding: "14px",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                color: isDark ? "#e0e0e0" : "#374151",
                background: isDark ? "#1a1a2e" : "#f9fafb",
                border: `1px solid ${isDark ? "#3f3f5e" : "#d1d5db"}`,
                borderRadius: "8px",
                resize: "none",
                outline: "none",
                transition: "all 0.2s ease",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                "&::placeholder": {
                  color: isDark ? "#6b7280" : "#9ca3af",
                  opacity: 1,
                },
                "&:hover": {
                  background: isDark ? "#232439" : "#f3f4f6",
                  borderColor: isDark ? "#4f4f6e" : "#9ca3af",
                },
                "&:focus": {
                  background: isDark ? "#2a2a3e" : "#ffffff",
                  borderColor: modalColor,
                  borderWidth: "2px",
                  padding: "13px", // Ajuste para compensar el borde más grueso
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: "block",
                color: isDark ? "#9ca3af" : "#6b7280",
                textAlign: "right",
              }}
            >
              {formData.descripcion.length} caracteres
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio"
                type="number"
                value={formData.precio_producto}
                onChange={handleChange("precio_producto")}
                error={!!errors.precio_producto}
                helperText={errors.precio_producto}
                fullWidth
                required
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={handleChange("stock")}
                error={!!errors.stock}
                helperText={errors.stock}
                fullWidth
                required
                inputProps={{ min: "0" }}
              />
            </Grid>
          </Grid>

          <TextField
            select
            label="Categoría"
            value={formData.category_id}
            onChange={handleChange("category_id")}
            fullWidth
            required
          >
            <MenuItem value="">Selecciona una categoría</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre_categoria}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Subcategoría"
            value={formData.sub_category_id}
            onChange={handleChange("sub_category_id")}
            error={!!errors.sub_category_id}
            helperText={errors.sub_category_id}
            fullWidth
            required
            disabled={!formData.category_id || loadingSubCategories}
          >
            {loadingSubCategories ? (
              <MenuItem value="">
                <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
              </MenuItem>
            ) : subCategories.length === 0 ? (
              <MenuItem value="">Selecciona una categoría primero</MenuItem>
            ) : (
              subCategories.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.nombre}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            select
            label="Descuento (Opcional)"
            value={formData.discount_id}
            onChange={handleChange("discount_id")}
            fullWidth
          >
            <MenuItem value="">Sin descuento</MenuItem>
            {discounts.map((disc) => (
              <MenuItem key={disc.id} value={disc.id}>
                {disc.nombre} ({disc.tipo === "porcentaje" ? `${disc.valor}%` : `$${disc.valor}`})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, borderTop: `1px solid ${isDark ? "#333" : "#e5e7eb"}` }}>
        <Button onClick={handleClose} disabled={isSubmitting} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            background: `linear-gradient(135deg, ${modalColor} 0%, ${
              mode === "create" ? "#10bbffff" : "#b117c5ff"
            } 100%)`,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            minWidth: "120px",
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === "create" ? (
            "Crear"
          ) : (
            "Guardar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;