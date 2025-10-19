import React, { useState, useMemo, useEffect } from "react";
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
  Snackbar, // <-- NUEVO
  Alert,    // <-- NUEVO
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

  // NUEVO: estado para alertas
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Función para mostrar alertas
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Cierra el snackbar
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else showAlert("No está autenticado", "error");
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/categories", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err));

    fetch("https://localhost:4000/api/v1/discounts", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setDiscounts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando descuentos", err));
  }, [token]);

  // ✅ Cargar productos
  const fetchProducts = () => {
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
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  // ------------------------------------------
  // COLUMNAS
  // ------------------------------------------
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableEditing: false,
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
        Cell: ({ cell }) => (
          <img
            src={
              cell.getValue() ||
              "https://placehold.co/60x60?text=Sin+imagen"
            }
            alt="Producto"
            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }}
          />
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
            <div>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #eee"
                  }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleChange} style={{marginTop: "0.5em"}} />
            </div>
          );
        },
      },
      {
        accessorKey: "nombre_producto",
        header: "Producto",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.nombre_producto,
          helperText: validationErrors?.nombre_producto,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              nombre_producto: undefined,
            })),
        },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        muiEditTextFieldProps: { multiline: true, minRows: 2, maxRows: 4 },
        enableHiding: true,
        Cell: ({ cell }) => cell.getValue() || "Sin descripción",
      },
      {
        accessorFn: row =>
          row?.sub_category?.category?.nombre_categoria ||
          row?.category?.nombre_categoria ||
          "",
        id: "category_name",
        header: "Categoría",
        size: 150,
        filterFn: "includesString",
        Cell: ({ cell }) => (
          <span style={{ fontWeight: 500, color: isDark ? "#eaa8f5" : "#a12c7f" }}>
            {cell.getValue() || ""}
          </span>
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

                // Llama a setSubCatId en el subcategory select
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
            >
              {categories.length === 0 ? (
                <MenuItem value="">
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando categorías...
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
        Cell: ({ row }) => row.original?.sub_category?.nombre || "",
        Edit: ({ row, column }) => {
          // Estado local SOLO para este select y este render
          const [subCatState, setSubCatState] = useState({
            loading: false,
            subs: [],
          });
          // Guardar la función en la fila para que el select de categoría pueda usarla
          row._setSubCatState = setSubCatState;

          // Si la categoría ya está seleccionada y no hemos cargado, cargarla
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
              disabled={subCatState.loading}
            >
              {subCatState.loading ? (
                <MenuItem value="">
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Cargando subcategorías...
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
        Cell: ({ row }) =>
          row.original?.discount
            ? `${row.original.discount.nombre} (${row.original.discount.tipo === "porcentaje"
              ? `${row.original.discount.valor}%`
              : `$${row.original.discount.valor}`})`
            : "Sin descuento",
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
            >
              <MenuItem value="">Sin descuento</MenuItem>
              {discounts.map(desc => (
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
        muiEditTextFieldProps: { type: "number", required: true },
        Cell: ({ cell }) => formatCOP(cell.getValue()),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        muiEditTextFieldProps: { type: "number", required: true },
      },
    ],
    [validationErrors, categories, discounts, isDark, token]
  );

  // ------------------------------
  // CRUD con alertas
  // ------------------------------
  const handleCreateProduct = async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const formData = new FormData();
    for (const key in values) {
      if (key === "imagen" && values[key] instanceof File) {
        formData.append("product[imagen]", values[key]);
      } else {
        formData.append(`product[${key}]`, values[key]);
      }
    }

    try {
      if (!token) return;
      const res = await fetch("https://localhost:4000/api/v1/products", {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
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
  };

  const handleSaveProduct = async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const formData = new FormData();
    for (const key in values) {
      if (key === "imagen" && values[key] instanceof File) {
        formData.append("product[imagen]", values[key]);
      } else {
        formData.append(`product[${key}]`, values[key]);
      }
    }

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/products/${values.slug}`,
        {
          method: "PUT",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
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
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar producto "${row.original.nombre_producto}"?`))
      return;

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/products/${row.original.slug}`,
        {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
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
  };

  // MODAL PERSONALIZADO
  function CustomDialog({ open, title, color, children, actions }) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth PaperProps={{
        sx: {
          borderRadius: "18px",
          background: isDark ? "#232439" : "#f8fafc",
          boxShadow: "0 4px 32px rgba(37,99,235,0.13)",
          px: 3, py: 2,
        }
      }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.7em", color: color }}>
          {title}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2em",
            pb: 1,
            pt: 1,
          }}
        >
          {children}
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>{actions}</DialogActions>
      </Dialog>
    );
  }

  const tableInstance = useMaterialReactTable({
    columns,
    data: products,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: true, density: "comfortable" },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error al cargar productos" }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
        width: "100%",
        overflowX: "auto",
        backgroundColor: isDark ? theme.palette.background.default : "#fff",
      },
    },
    muiTablePaperProps: {
      sx: {
        width: "100%",
        maxWidth: "1800px",
        margin: "0 auto",
        boxShadow: "none",
        border: "none",
        backgroundColor: isDark ? theme.palette.background.paper : "#fff",
        color: isDark ? "#fff" : "#000",
        padding: 0,
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "auto",
        minWidth: "1700px",
        "& th": {
          color: isDark ? "#fff" : "#000",
          borderBottom: `1px solid ${isDark ? "#555" : "#ccc"}`,
          backgroundColor: isDark ? "#2d2d2d" : "#f5f6fa",
          fontWeight: 700,
          fontSize: "1.09em",
        },
        "& td": {
          color: isDark ? "#fff" : "#000",
          borderBottom: `1px solid ${isDark ? "#555" : "#ececec"}`,
          fontSize: "1.08em",
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
        color="#2563eb"
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
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Editar">
          <IconButton color="primary" onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton color="error" onClick={() => handleDelete(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        sx={{
          background: "#2563eb",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "1em",
          px: 2.8,
          py: 1.1,
          boxShadow: "0 1px 6px rgba(37,99,235,0.13)",
          ":hover": { background: "#174bbd" }
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
      <Typography variant="h4" component="h2" sx={{
        fontWeight: 800,
        color: "#2563eb",
        mb: 3,
        letterSpacing: "-0.5px",
        textAlign: "left"
      }}>
        Productos
      </Typography>
      <MaterialReactTable table={tableInstance} />
      {/* ALERTA BONITA */}
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
            fontSize: "1.07em",
            boxShadow: "0 2px 18px rgba(37,99,235,0.07)",
            borderRadius: "9px",
            background: alert.severity === "success" ? "#e3f6e5" : "#fbeaea",
            color: alert.severity === "success" ? "#217a3b" : "#b32b2b"
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
    nombre_producto: !product.nombre_producto
      ? "El nombre es obligatorio"
      : "",
    sub_category_id: !product.sub_category_id
      ? "La subcategoría es obligatoria"
      : "",
    precio_producto:
      product.precio_producto === "" ||
      Number(product.precio_producto) <= 0
        ? "El precio debe ser mayor a 0"
        : "",
    stock:
      product.stock === "" || Number(product.stock) < 0
        ? "El stock no puede ser negativo"
        : "",
  };
}

export default ProductTable;