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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  useCreateProduct,
  useGetProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "../../hooks/productHooks";
import "../../assets/stylesheets/ProductTable.css";

const ProductTable = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Cargar categorías con JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://localhost:4000/api/v1/categories", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err));
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", enableEditing: false, size: 60 },
      {
        accessorKey: "imagen_url",
        header: "Imagen",
        enableEditing: false,
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
        muiEditTextFieldProps: {
          multiline: true,
          minRows: 2,
          maxRows: 4,
        },
      },
      {
        accessorKey: "category_id",
        header: "Categoría",
        // Mostrar el nombre en la celda normal
        Cell: ({ row }) => row.original?.category?.nombre_categoria || "",
        // Editor custom para Select
        Edit: ({ row, column }) => {
          // valor actual como string para evitar mismatch con MenuItem
          const current =
            row._valuesCache?.[column.id] ??
            (row.original.category_id != null
              ? String(row.original.category_id)
              : "");

          return (
            <TextField
              select
              value={current}
              onChange={(e) => {
                const v = e.target.value; // string
                if (!row._valuesCache) row._valuesCache = {};
                row._valuesCache[column.id] = v; // guarda como string
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
        muiEditTextFieldProps: {
          type: "number",
          required: true,
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        muiEditTextFieldProps: {
          type: "number",
          required: true,
        },
      },
    ],
    [validationErrors, categories]
  );

  const { mutateAsync: createProduct } = useCreateProduct();
  const { data: products = [], isLoading, isError } = useGetProducts();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const handleCreateProduct = async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    // Si category_id viene como string desde el Select, conviértelo aquí
    const payload = {
      ...values,
      category_id:
        typeof values.category_id === "string"
          ? parseInt(values.category_id, 10)
          : values.category_id,
    };
    await createProduct(payload);
    table.setCreatingRow(null);
  };

  const handleSaveProduct = async ({ values, table }) => {
    const errors = validateProduct(values);
    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    const payload = {
      ...values,
      category_id:
        typeof values.category_id === "string"
          ? parseInt(values.category_id, 10)
          : values.category_id,
    };
    await updateProduct(payload);
    table.setEditingRow(null);
  };

  const handleDelete = (row) => {
    if (window.confirm(`¿Eliminar producto "${row.original.nombre_producto}"?`)) {
      deleteProduct(row.original.id);
    }
  };

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
    muiTableContainerProps: { sx: { minHeight: "500px" } },
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
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => table.setCreatingRow(true)}>
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
