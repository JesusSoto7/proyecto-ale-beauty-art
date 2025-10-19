import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import "../../assets/stylesheets/ProductTable.css";
import { formatCOP } from "../../services/currency";

const ProductTable = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState(null);

  const showAlert = useCallback((message, severity = "success") => {
    setAlert({ open: true, message, severity });
  }, []);

  const handleCloseAlert = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else showAlert("No está autenticado", "error");
  }, [showAlert]);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err));

    fetch("https://localhost:4000/api/v1/discounts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDiscounts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando descuentos", err));
  }, [token]);

  const fetchProducts = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    fetch("https://localhost:4000/api/v1/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error cargando productos", err);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Componente memoizado para el nombre del producto
  const ProductNameEdit = React.memo(({ row, column, validationErrors, setValidationErrors }) => {
    const [value, setValue] = useState(row.original?.nombre_producto || "");

    const handleChange = useCallback((e) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (!row._valuesCache) row._valuesCache = {};
      row._valuesCache[column.id] = newValue;
      
      if (validationErrors?.nombre_producto) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nombre_producto;
          return newErrors;
        });
      }
    }, [row, column.id, validationErrors, setValidationErrors]);

    return (
      <TextField
        value={value}
        onChange={handleChange}
        fullWidth
        required
        label="Nombre del Producto"
        error={!!validationErrors?.nombre_producto}
        helperText={validationErrors?.nombre_producto}
        placeholder="Ej: Laptop HP, Camiseta Nike..."
        autoComplete="off"
        InputLabelProps={{ shrink: true }}
      />
    );
  });

  // Componente memoizado para la descripción
  const DescriptionEdit = React.memo(({ row, column }) => {
    const [value, setValue] = useState(row.original?.descripcion || "");

    const handleChange = useCallback((e) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (!row._valuesCache) row._valuesCache = {};
      row._valuesCache[column.id] = newValue;
    }, [row, column.id]);

    return (
      <TextField
        value={value}
        onChange={handleChange}
        fullWidth
        multiline
        rows={5}
        label="Descripción del Producto"
        placeholder="Describe las características, especificaciones y detalles del producto..."
        InputLabelProps={{ shrink: true }}
        sx={{
          "& .MuiOutlinedInput-root": {
            alignItems: "flex-start",
            overflow: "hidden",
          },
          "& .MuiInputBase-input": {
            padding: "12px !important",
            fontSize: "0.95em",
            lineHeight: "1.5",
            fontFamily: "inherit",
            resize: "none",
            maxHeight: "200px",
            overflow: "auto !important",
          },
        }}
      />
    );
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableEditing: false,
        size: 60,
        Edit: () => null,
      },
      {
        accessorKey: "slug",
        header: "Slug",
        enableEditing: false,
        enableSorting: false,
        enableHiding: true,
        Edit: () => null,
      },
      {
        accessorKey: "imagen_url",
        header: "Imagen",
        enableEditing: true,
        size: 80,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={cell.getValue() || "https://placehold.co/60x60?text=Sin+imagen"}
              alt="Producto"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "12px",
                border: `2px solid ${isDark ? "#444" : "#e0e0e0"}`,
                transition: "transform 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            />
          </Box>
        ),
        Edit: ({ row }) => {
          const [preview, setPreview] = useState(row.original?.imagen_url || null);
          const handleChange = (e) => {
            const file = e.target.files[0];
            if (!row._valuesCache) row._valuesCache = {};
            row._valuesCache["imagen"] = file || null;
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setPreview(reader.result);
              reader.readAsDataURL(file);
            }
          };
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: `2px solid #2563eb`,
                  }}
                />
              )}
              <Button variant="outlined" component="label" size="small" sx={{ textTransform: "none" }}>
                Seleccionar imagen
                <input type="file" accept="image/*" onChange={handleChange} hidden />
              </Button>
            </Box>
          );
        },
      },
      {
        accessorKey: "nombre_producto",
        header: "Producto",
        size: 200,
        Cell: ({ cell }) => (
          <Typography sx={{ fontWeight: 600, color: isDark ? "#fff" : "#000" }}>
            {cell.getValue()}
          </Typography>
        ),
        Edit: ({ row, column }) => (
          <ProductNameEdit
            row={row}
            column={column}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        ),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        size: 250,
        enableHiding: true,
        Cell: ({ cell }) => {
          const text = cell.getValue() || "Sin descripción";
          const maxLength = 50;
          const truncated = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
          
          return (
            <Tooltip title={text} placement="top">
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? "#aaa" : "#666",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "250px",
                  cursor: "pointer",
                }}
              >
                {truncated}
              </Typography>
            </Tooltip>
          );
        },
        Edit: ({ row, column }) => <DescriptionEdit row={row} column={column} />,
      },
      {
        accessorFn: (row) =>
          row?.sub_category?.category?.nombre_categoria ||
          row?.category?.nombre_categoria ||
          "",
        id: "category_name",
        header: "Categoría",
        size: 150,
        filterFn: "includesString",
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() || "Sin categoría"}
            sx={{
              background: isDark ? "#4a3f5f" : "#e6d5f5",
              color: isDark ? "#eaa8f5" : "#a12c7f",
              fontWeight: 600,
            }}
          />
        ),
        Edit: ({ row, column }) => {
          const [current, setCurrent] = useState(
            row._valuesCache?.["category_id"] ??
              (row.original.category_id != null
                ? String(row.original.category_id)
                : "")
          );
          return (
            <TextField
              select
              value={current}
              onChange={async (e) => {
                const newCategoryId = e.target.value;
                setCurrent(newCategoryId);
                if (!row._valuesCache) row._valuesCache = {};
                row._valuesCache["category_id"] = newCategoryId;
                row._valuesCache["sub_category_id"] = "";

                if (row._setSubCatState) row._setSubCatState({ loading: true, subs: [] });
                try {
                  const response = await fetch(
                    `https://localhost:4000/api/v1/categories/${newCategoryId}/sub_categories`,
                    {
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                  );
                  const data = await response.json();
                  if (row._setSubCatState) row._setSubCatState({ loading: false, subs: data });
                } catch {
                  if (row._setSubCatState) row._setSubCatState({ loading: false, subs: [] });
                }
              }}
              fullWidth
              size="small"
              label="Categoría"
              required
              InputLabelProps={{ shrink: true }}
            >
              {categories.length === 0 ? (
                <MenuItem value="">
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
                </MenuItem>
              ) : (
                categories.map((cat, idx) => (
                  <MenuItem
                    key={cat.id ? `cat-${cat.id}` : `cat-${idx}`}
                    value={String(cat.id)}
                  >
                    {cat.nombre_categoria}
                  </MenuItem>
                ))
              )}
            </TextField>
          );
        },
        muiEditTextFieldProps: { required: true },
      },
      {
        accessorKey: "sub_category_id",
        header: "Subcategoría",
        size: 150,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ color: isDark ? "#aaa" : "#666" }}>
            {row.original?.sub_category?.nombre || "—"}
          </Typography>
        ),
        Edit: ({ row, column }) => {
          const [subCatState, setSubCatState] = useState({
            loading: false,
            subs: [],
          });
          row._setSubCatState = setSubCatState;

          useEffect(() => {
            const catId =
              row._valuesCache?.["category_id"] ??
              (row.original.category_id != null
                ? String(row.original.category_id)
                : "");
            if (!catId) return setSubCatState({ loading: false, subs: [] });
            if (subCatState.subs.length === 0 && !subCatState.loading) {
              setSubCatState((prev) => ({ ...prev, loading: true }));
              fetch(
                `https://localhost:4000/api/v1/categories/${catId}/sub_categories`,
                {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
              )
                .then((res) => res.json())
                .then((data) => setSubCatState({ loading: false, subs: data }))
                .catch(() => setSubCatState({ loading: false, subs: [] }));
            }
          }, [row._valuesCache?.["category_id"], token]);

          const [current, setCurrent] = useState(
            row._valuesCache?.[column.id] ??
              (row.original.sub_category_id != null
                ? String(row.original.sub_category_id)
                : "")
          );
          return (
            <TextField
              select
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                if (!row._valuesCache) row._valuesCache = {};
                row._valuesCache[column.id] = e.target.value;
              }}
              fullWidth
              size="small"
              label="Subcategoría"
              required
              disabled={subCatState.loading}
              InputLabelProps={{ shrink: true }}
            >
              {subCatState.loading ? (
                <MenuItem value="">
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando...
                </MenuItem>
              ) : subCatState.subs.length === 0 ? (
                <MenuItem value="">Selecciona una categoría primero</MenuItem>
              ) : (
                subCatState.subs.map((sub, idx) => (
                  <MenuItem
                    key={sub.id ? `sub-${sub.id}` : `sub-${idx}`}
                    value={String(sub.id)}
                  >
                    {sub.nombre}
                  </MenuItem>
                ))
              )}
            </TextField>
          );
        },
        muiEditTextFieldProps: { required: true },
      },
      {
        accessorKey: "discount_id",
        header: "Descuento",
        size: 180,
        Cell: ({ row }) =>
          row.original?.discount ? (
            <Chip
              label={`${row.original.discount.nombre} (${
                row.original.discount.tipo === "porcentaje"
                  ? `${row.original.discount.valor}%`
                  : `$${row.original.discount.valor}`
              })`}
              sx={{
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: 600,
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: isDark ? "#aaa" : "#999" }}>
              Sin descuento
            </Typography>
          ),
        Edit: ({ row, column }) => {
          const [current, setCurrent] = useState(
            row._valuesCache?.[column.id] ??
              (row.original.discount_id != null
                ? String(row.original.discount_id)
                : "")
          );
          return (
            <TextField
              select
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                if (!row._valuesCache) row._valuesCache = {};
                row._valuesCache[column.id] = e.target.value;
              }}
              fullWidth
              size="small"
              label="Descuento (Opcional)"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">Sin descuento</MenuItem>
              {discounts.map((desc) => (
                <MenuItem key={desc.id} value={String(desc.id)}>
                  {desc.nombre} ({desc.tipo === "porcentaje" ? `${desc.valor}%` : `$${desc.valor}`})
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
      {
        accessorKey: "precio_producto",
        header: "Precio",
        size: 180,
        Cell: ({ row }) => {
          const priceOriginal = row.original.precio_producto;
          const priceDiscount = row.original.precio_con_mejor_descuento;
          const discount = row.original.mejor_descuento_para_precio;

          return (
            <Box>
              {priceDiscount && priceDiscount < priceOriginal ? (
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#dc2626",
                      fontSize: "1.1em",
                    }}
                  >
                    {formatCOP(priceDiscount)}
                  </Typography>
                  <Typography
                    sx={{
                      textDecoration: "line-through",
                      color: "#64748b",
                      fontSize: "0.9em",
                    }}
                  >
                    {formatCOP(priceOriginal)}
                  </Typography>
                  {discount && discount.tipo === "porcentaje" && (
                    <Chip
                      label={`-${discount.valor}%`}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: "#fef3c7",
                        color: "#92400e",
                        fontWeight: 600,
                        fontSize: "0.75em",
                      }}
                    />
                  )}
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#2563eb",
                    fontSize: "1.1em",
                  }}
                >
                  {formatCOP(priceOriginal)}
                </Typography>
              )}
            </Box>
          );
        },
        muiEditTextFieldProps: {
          type: "number",
          required: true,
          step: "0.01",
          label: "Precio",
          InputLabelProps: { shrink: true },
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        size: 100,
        Cell: ({ cell }) => {
          const stock = cell.getValue();
          const isLow = stock < 10;
          const isOut = stock === 0;
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Chip
                label={stock}
                sx={{
                  fontWeight: 700,
                  background: isOut ? "#fee2e2" : isLow ? "#fef3c7" : "#d1fae5",
                  color: isOut ? "#b91c1c" : isLow ? "#92400e" : "#065f46",
                }}
              />
            </Box>
          );
        },
        muiEditTextFieldProps: {
          type: "number",
          required: true,
          label: "Stock",
          InputLabelProps: { shrink: true },
        },
      },
    ],
    [validationErrors, categories, discounts, isDark, token]
  );

  const handleCreateProduct = useCallback(async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const formData = new FormData();
    
    if (values.nombre_producto) formData.append("product[nombre_producto]", values.nombre_producto);
    if (values.descripcion) formData.append("product[descripcion]", values.descripcion);
    if (values.precio_producto) formData.append("product[precio_producto]", values.precio_producto);
    if (values.stock !== undefined && values.stock !== null && values.stock !== "") {
      formData.append("product[stock]", values.stock);
    }
    if (values.sub_category_id && values.sub_category_id !== "") {
      formData.append("product[sub_category_id]", values.sub_category_id);
    }
    if (values.discount_id && values.discount_id !== "" && values.discount_id !== "null") {
      formData.append("product[discount_id]", values.discount_id);
    } else {
      formData.append("product[discount_id]", "");
    }
    if (values.imagen && values.imagen instanceof File) {
      formData.append("product[imagen]", values.imagen);
    }

    try {
      if (!token) return;
      const res = await fetch("https://localhost:4000/api/v1/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(`Error creando producto: ${errorData.error || res.statusText}`, "error");
        return;
      }

      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      table.setCreatingRow(null);
      showAlert("Producto agregado correctamente", "success");
    } catch (err) {
      console.error("Error creando producto:", err);
      showAlert("Ocurrió un error creando el producto", "error");
    }
  }, [token, showAlert]);

  const handleSaveProduct = useCallback(async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const formData = new FormData();
    
    if (values.nombre_producto) formData.append("product[nombre_producto]", values.nombre_producto);
    if (values.descripcion) formData.append("product[descripcion]", values.descripcion);
    if (values.precio_producto) formData.append("product[precio_producto]", values.precio_producto);
    if (values.stock !== undefined && values.stock !== null && values.stock !== "") {
      formData.append("product[stock]", values.stock);
    }
    if (values.sub_category_id && values.sub_category_id !== "") {
      formData.append("product[sub_category_id]", values.sub_category_id);
    }
    if (values.discount_id && values.discount_id !== "" && values.discount_id !== "null") {
      formData.append("product[discount_id]", values.discount_id);
    } else {
      formData.append("product[discount_id]", "");
    }
    if (values.imagen && values.imagen instanceof File) {
      formData.append("product[imagen]", values.imagen);
    }

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/products/${values.slug}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(`Error actualizando producto: ${errorData.error || res.statusText}`, "error");
        return;
      }

      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.slug === updatedProduct.slug ? updatedProduct : p))
      );
      table.setEditingRow(null);
      showAlert("Producto actualizado correctamente", "success");
    } catch (err) {
      console.error("Error actualizando producto:", err);
      showAlert("Ocurrió un error actualizando el producto", "error");
    }
  }, [token, showAlert]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(`¿Eliminar producto "${row.original.nombre_producto}"?`))
      return;

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/products/${row.original.slug}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(`Error eliminando producto: ${errorData.error || res.statusText}`, "error");
        return;
      }

      setProducts((prev) => prev.filter((p) => p.slug !== row.original.slug));
      showAlert("Producto eliminado correctamente", "success");
    } catch (err) {
      console.error("Error eliminando producto:", err);
      showAlert("Ocurrió un error eliminando el producto", "error");
    }
  }, [token, showAlert]);

  const CustomDialog = React.memo(({ open, title, color, children, actions }) => {
    return (
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: isDark ? "#1e1e2e" : "#ffffff",
            boxShadow: "0 20px 60px rgba(37, 99, 235, 0.15)",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.5em",
            color: color,
            borderBottom: `2px solid ${color}`,
            pb: 2,
            flexShrink: 0,
          }}
        >
          {title}
        </DialogTitle>
        
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5em",
            py: 3,
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: isDark ? "#2a2a3e" : "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: isDark ? "#4a5568" : "#cbd5e0",
              borderRadius: "4px",
              "&:hover": {
                background: isDark ? "#5a6578" : "#a0aec0",
              },
            },
          }}
        >
          {children}
        </DialogContent>
        
        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            flexShrink: 0,
            borderTop: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
          }}
        >
          {actions}
        </DialogActions>
      </Dialog>
    );
  });

  const tableInstance = useMaterialReactTable({
    columns,
    data: products,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true, density: "comfortable" },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error al cargar productos" }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "600px",
        maxHeight: "calc(100vh - 300px)",
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
        backgroundColor: isDark ? "#0f0f1e" : "#f9fafb",
        borderRadius: "16px",
        "&::-webkit-scrollbar": {
          height: "12px",
          width: "12px",
        },
        "&::-webkit-scrollbar-track": {
          background: isDark ? "#1a1a2e" : "#f1f1f1",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: isDark ? "#4a5568" : "#cbd5e0",
          borderRadius: "10px",
          "&:hover": {
            background: isDark ? "#5a6578" : "#a0aec0",
          },
        },
      },
    },
    muiTablePaperProps: {
      sx: {
        width: "100%",
        boxShadow: isDark
          ? "0 10px 40px rgba(0, 0, 0, 0.3)"
          : "0 10px 40px rgba(37, 99, 235, 0.08)",
        borderRadius: "16px",
        border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "auto",
        minWidth: "1400px",
        "& thead": {
          position: "sticky",
          top: 0,
          zIndex: 2,
          "& th": {
            color: isDark ? "#e0e0e0" : "#1f2937",
            backgroundColor: isDark ? "#0f0f1e" : "#f3f4f6",
            borderBottom: `2px solid ${isDark ? "#333" : "#e5e7eb"}`,
            fontWeight: 800,
            fontSize: "0.95em",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            padding: "16px 12px",
            whiteSpace: "normal",
            wordWrap: "break-word",
          },
        },
        "& tbody": {
          "& tr": {
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: isDark ? "#232439" : "#f0f9ff",
              boxShadow: isDark
                ? "inset 0 0 0 1px #333"
                : "inset 0 0 0 1px #e0e7ff",
            },
          },
          "& td": {
            color: isDark ? "#d1d5db" : "#374151",
            borderBottom: `1px solid ${isDark ? "#2a2a3e" : "#f3f4f6"}`,
            padding: "16px 12px",
            fontSize: "0.95em",
            whiteSpace: "normal",
            wordWrap: "break-word",
          },
        },
      },
    },
    displayColumnDefOptions: {
      'mrt-row-actions': {
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            backgroundColor: isDark ? "#0f0f1e" : "#f3f4f6",
            boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
            zIndex: 1,
          },
        },
        muiTableBodyCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
            boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
            zIndex: 1,
          },
        },
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduct,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduct,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <CustomDialog
        open
        title="Agregar Producto"
        color="#bb4d8dff"
        actions={<MRT_EditActionButtons variant="contained" table={table} row={row} />}
      >
        {internalEditComponents}
      </CustomDialog>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <CustomDialog
        open
        title="Editar Producto"
        color="#f59e42"
        actions={<MRT_EditActionButtons variant="contained" table={table} row={row} />}
      >
        {internalEditComponents}
      </CustomDialog>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <Tooltip title="Editar">
          <IconButton
            color="primary"
            onClick={() => table.setEditingRow(row)}
            sx={{
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#dbeafe",
                transform: "scale(1.1)",
              },
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            color="error"
            onClick={() => handleDelete(row)}
            sx={{
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#fee2e2",
                transform: "scale(1.1)",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        sx={{
          background: "linear-gradient(135deg, #ff9ccaff 0%, #af1e62ff 100%)",
          color: "#fff",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "0.95em",
          px: 3,
          py: 1.2,
          boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
          transition: "all 0.3s ease",
          textTransform: "none",
          ":hover": {
            background: "linear-gradient(135deg, #af1e56ff 0%, #f086c0ff 100%)",
            boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
            transform: "translateY(-2px)",
          },
        }}
        startIcon={<AddIcon />}
        onClick={() => table.setCreatingRow(true)}
      >
        Nuevo Producto
      </Button>
    ),
    state: { isLoading },
  });

  return (
    <Box sx={{ width: "100%", px: 0, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            letterSpacing: "-0.5px",
          }}
        >
          Productos
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          Gestiona tu catálogo de productos
        </Typography>
      </Box>

      <MaterialReactTable table={tableInstance} />

      <Snackbar
        open={alert.open}
        autoHideDuration={2800}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{
            width: "100%",
            fontWeight: 600,
            fontSize: "1em",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            border: `1px solid ${
              alert.severity === "success" ? "#86efac" : "#fca5a5"
            }`,
            background:
              alert.severity === "success"
                ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            color:
              alert.severity === "success" ? "#166534" : "#991b1b",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

function validateProduct(product) {
  return {
    nombre_producto: !product.nombre_producto ? "El nombre es obligatorio" : "",
    sub_category_id: !product.sub_category_id ? "La subcategoría es obligatoria" : "",
    precio_producto:
      product.precio_producto === "" || Number(product.precio_producto) <= 0
        ? "El precio debe ser mayor a 0"
        : "",
    stock:
      product.stock === "" || Number(product.stock) < 0
        ? "El stock no puede ser negativo"
        : "",
  };
}

export default ProductTable;