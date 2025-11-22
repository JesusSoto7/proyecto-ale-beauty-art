// Opción A: Toolbar NO sticky, sólo header sticky
import React, { useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
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
  const handleCloseAlert = useCallback((_, reason) => {
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
      if (success) setModalState({ open: false, mode: null, product: null });
      return success;
    },
    [createProduct]
  );
  const handleUpdateProduct = useCallback(
    async (formData, slug) => {
      const success = await updateProduct(formData, slug);
      if (success) setModalState({ open: false, mode: null, product: null });
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

  const commonSurface = {
    bgcolor: "background.paper",
    borderColor: "divider",
  };

  const tableInstance = useMaterialReactTable({
    columns,
    data: products,
    getRowId: (row) => row.id,

    // Mostrar SIEMPRE el buscador global
    initialState: { density: "comfortable", showGlobalFilter: true },
    state: { isLoading },

    // Mostrar buscador global, quitar demás controles
    enableGlobalFilter: true,
    enableColumnFilters: false,
    enableColumnActions: false,
    enableHiding: false,
    enableDensityToggle: false,

    // ACTIVAR columna de acciones
    enableRowActions: true,
    positionActionsColumn: "last",

    // Renderizar solo el botón de pantalla completa
    renderToolbarInternalActions: ({ table }) => (
      <MRT_ToggleFullScreenButton table={table} />
    ),
    positionGlobalFilter: "left",

    muiTablePaperProps: {
      sx: (theme) => ({
        bgcolor: "background.paper",
        "&.mrt-full-screen": {
          bgcolor: "background.default",
        },
        "&.mrt-full-screen .MuiTableContainer-root": {
          maxHeight: "calc(100dvh - 120px)",
          minHeight: "calc(100dvh - 120px)",
          bgcolor: (theme.vars || theme).palette.background.paper,
        },
      }),
    },

    muiToolbarAlertBannerProps: isError
      ? {
        color: "error",
        sx: {
          ...commonSurface,
          border: `1px solid ${theme.palette.error.main}`,
          my: 0,
        },
      }
      : undefined,

    muiTopToolbarProps: {
      sx: {
        ...commonSurface,
        borderBottom: `1px solid ${theme.palette.divider}`,
        p: 1,
      },
    },
    muiBottomToolbarProps: {
      sx: {
        ...commonSurface,
        borderTop: `1px solid ${theme.palette.divider}`,
        p: 1,
      },
    },
    muiTablePaginationProps: {
      sx: {
        ...commonSurface,
        ".MuiTablePagination-select": { bgcolor: "background.paper" },
      },
    },
    muiTableContainerProps: {
      sx: {
        minHeight: "600px",
        maxHeight: "calc(100dvh - 220px)",
        width: "100%",
        overflow: "auto",
        bgcolor: "background.paper",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "auto",
        minWidth: "1400px",
        bgcolor: "background.paper",
        "& thead": {
          position: "sticky",
          top: 0,
          zIndex: 2,
          "& th": {
            bgcolor: "background.paper",
            borderBottom: `2px solid ${theme.palette.divider}`,
            fontWeight: 800,
            fontSize: "0.95rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            p: "12px 12px",
          },
        },
        "& tbody tr:hover": {
          bgcolor: theme.palette.action.hover,
        },
        "& tbody td": {
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: "14px 12px",
          fontSize: "0.95rem",
        },
      },
    },

    muiTableHeadCellProps: { sx: { bgcolor: "background.paper" } },
    muiTableBodyCellProps: { sx: { bgcolor: "background.paper" } },

    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 140,
        muiTableHeadCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            bgcolor: "background.paper",
            borderLeft: `1px solid ${theme.palette.divider}`,
            zIndex: 3,
          },
        },
        muiTableBodyCellProps: {
          sx: {
            position: "sticky",
            right: 0,
            bgcolor: "background.paper",
            borderLeft: `1px solid ${theme.palette.divider}`,
            zIndex: 2,
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
              transition: "transform 0.2s ease",
              "&:hover": { bgcolor: "action.hover", transform: "scale(1.06)" },
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
              transition: "transform 0.2s ease",
              "&:hover": { bgcolor: "action.hover", transform: "scale(1.06)" },
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
        startIcon={<AddIcon />}
        onClick={openCreateModal}
        sx={{
          borderRadius: 2,
          fontWeight: 700,
          fontSize: "0.9rem",
          px: 3,
          py: 1,
          textTransform: "none",
        }}
      >
        Nuevo Producto
      </Button>
    ),
  });

  return (
    <Box sx={{ width: "100%", px: 0, py: 4 }}>
      <Box sx={{ mb: 3 }}>
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
            fontSize: "0.95rem",
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