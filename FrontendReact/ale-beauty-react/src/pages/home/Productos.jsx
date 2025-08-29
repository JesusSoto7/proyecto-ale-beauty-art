// src/components/ProductTable.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
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

  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  // Cargar categorías
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/categories", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err));
  }, [token]);

  // Cargar productos
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
        Cell: ({ cell }) =>
          cell.getValue() ? (
            <img
              src={cell.getValue()}
              alt="Producto"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
          ) : (
            "Sin imagen"
          ),
        Edit: ({ row }) => {
          const [preview, setPreview] = useState(
            row.original?.imagen_url || null
          );

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
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleChange} />
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
        Cell: ({ cell }) => cell.getValue() || "Sin descripción", // Muestra '-' si no hay descripción
      },
      {
        accessorKey: "category_id",
        header: "Categoría",
        Cell: ({ row }) => row.original?.category?.nombre_categoria || "",
        Edit: ({ row, column }) => {
          const [current, setCurrent] = useState(
            row._valuesCache?.[column.id] ??
            (row.original.category_id != null ? String(row.original.category_id) : "")
          );
          useEffect(() => {
            if (!current && categories.length > 0) {
              setCurrent(categories[0].id.toString());
              if (!row._valuesCache) row._valuesCache = {};
              row._valuesCache[column.id] = categories[0].id.toString();
            }
          }, [categories]);

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
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.nombre_categoria}
                </MenuItem>
              ))}
            </TextField>
          );
        },
        muiEditTextFieldProps: { required: true },
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
    [validationErrors, categories]
  );

  // Funciones de crear, actualizar y eliminar productos
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
        alert(`Error creando producto: ${errorData.error || res.statusText}`);
        return;
      }

      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      table.setCreatingRow(null);
    } catch (err) {
      console.error("Error creando producto:", err);
      alert("Ocurrió un error creando el producto");
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
        alert(
          `Error actualizando producto: ${errorData.error || res.statusText}`
        );
        return;
      }

      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.slug === updatedProduct.slug ? updatedProduct : p))
      );
      table.setEditingRow(null);
    } catch (err) {
      console.error("Error actualizando producto:", err);
      alert("Ocurrió un error actualizando el producto");
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
        alert(`Error eliminando producto: ${errorData.error || res.statusText}`);
        return;
      }

      setProducts((prev) => prev.filter((p) => p.slug !== row.original.slug));
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert("Ocurrió un error eliminando el producto");
    }
  };

  // Configuración de la tabla
  const table = useMaterialReactTable({
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
        overflowX: "auto",
        backgroundColor: isDark ? theme.palette.background.paper : "#fff",
        color: isDark ? "#fff" : "#000",
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "auto",
        minWidth: "900px",
        "& th": {
          color: isDark ? "#fff" : "#000",
          borderBottom: `1px solid ${isDark ? "#555" : "#ccc"}`,
        },
        "& td": {
          color: isDark ? "#fff" : "#000",
          borderBottom: `1px solid ${isDark ? "#555" : "#ccc"}`,
        },
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduct,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduct,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle>Agregar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="contained" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="contained" table={table} row={row} />
        </DialogActions>
      </>
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
        startIcon={<AddIcon />}
        onClick={() => table.setCreatingRow(true)}
      >
        Nuevo Producto
      </Button>
    ),
    state: { isLoading },
  });

  return <MaterialReactTable table={table} />;
};

function validateProduct(product) {
  return {
    nombre_producto: !product.nombre_producto ? "El nombre es obligatorio" : "",
    category_id: !product.category_id ? "La categoría es obligatoria" : "",
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
