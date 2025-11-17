import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { formatCOP } from "../../../services/currency";
import { useProducts } from "./hooks/useProducts";
import { useProductColumns } from "./hooks/useProductColumns";
import ProductModal from "./ProductModal";

const ProductTable = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [modalState, setModalState] = useState({ open: false, mode: null, product: null });

  const showAlert = useCallback((message, severity = "success") => {
    setAlert({ open: true, message, severity });
  }, []);

  const handleCloseAlert = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const {
    products,
    isLoading,
    isError,
    token,
    categories,
    discounts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(showAlert);

  const columns = useProductColumns({ categories, discounts, isDark, token });

  const handleCreateProduct = useCallback(
    async (formData) => {
      const success = await createProduct(formData);
      if (success) {
        setModalState({ open: false, mode: null, product: null });
      }
      return success;
    },
    [createProduct]
  );

  const handleUpdateProduct = useCallback(
    async (formData, slug) => {
      const success = await updateProduct(formData, slug);
      if (success) {
        setModalState({ open: false, mode: null, product: null });
      }
      return success;
    },
    [updateProduct]
  );

  const handleDelete = useCallback(
    async (row) => {
      if (!window.confirm(`¿Eliminar producto "${row.original.nombre_producto}"?`)) return;
      await deleteProduct(row.original.slug);
    },
    [deleteProduct]
  );

  const openCreateModal = useCallback(() => {
    setModalState({ open: true, mode: "create", product: null });
  }, []);

  const openEditModal = useCallback((product) => {
    setModalState({ open: true, mode: "edit", product });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, mode: null, product: null });
  }, []);

  const tableInstance = useMaterialReactTable({
    columns,
    data: products,
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
        backgroundColor: "background.paper",
        borderRadius: "16px",
        "&::-webkit-scrollbar": {
          height: "12px",
          width: "12px",
        },
        "&::-webkit-scrollbar-track": {
          background: "background.paper",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "background.paper",
          borderRadius: "10px",
          "&:hover": {
            background: "background.paper",
          },
        },
      },
    },
    muiTablePaperProps: {
      sx: {
        width: "100%",
        boxShadow: "background.paper",
        borderRadius: "16px",
        border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
        backgroundColor: "background.paper",
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
            backgroundColor: "background.paper",
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
              backgroundColor: "background.paper",
              boxShadow: "background.paper",
            },
          },
          "& td": {
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
      "mrt-row-actions": {
        size: 120,
        muiTableHeadCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            backgroundColor: "background.paper",
            boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
            zIndex: 1,
          },
        },
        muiTableBodyCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            backgroundColor: "background.paper",
            boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
            zIndex: 1,
          },
        },
      },
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <Tooltip title="Editar">
          <IconButton
            color="primary"
            onClick={() => openEditModal(row.original)}
            sx={{
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "background.paper",
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
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        sx={{
          background: "background.paper",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "0.95em",
          px: 3,
          py: 1.2,
          boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
          transition: "all 0.3s ease",
          textTransform: "none",
          ":hover": {
            background: "linear-gradient(135deg, #1eaf5aff 0%, #3330ceff 100%)",
            boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
            transform: "translateY(-2px)",
          },
        }}
        startIcon={<AddIcon />}
        onClick={openCreateModal}
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
        <Typography variant="body2" sx={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
          Gestiona tu catálogo de productos
        </Typography>
      </Box>

      <MaterialReactTable table={tableInstance} />

      <ProductModal
        open={modalState.open}
        mode={modalState.mode}
        product={modalState.product}
        onClose={closeModal}
        onSubmit={modalState.mode === "create" ? handleCreateProduct : handleUpdateProduct}
        categories={categories}
        discounts={discounts}
        token={token}
        isDark={isDark}
      />

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
            border: `1px solid ${alert.severity === "success" ? "#86efac" : "#fca5a5"}`,
            background:
              alert.severity === "success"
                ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            color: alert.severity === "success" ? "#166534" : "#991b1b",
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductTable;