import { useMemo } from "react";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import { formatCOP } from "../../../../services/currency";

export const useProductColumns = ({ isDark }) => {
  return useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableEditing: false,
        backgroundColor: "background.paper",
        size: 60,
      },
      {
        accessorKey: "imagen_url",
        header: "Imagen",
        enableEditing: false,
        size: 80,
        Cell: ({ cell }) => {
          const imageUrl = cell.getValue() || "https://placehold.co/60x60?text=Sin+imagen";
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img
                src={imageUrl}
                alt="Producto"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  backgroundColor: "background.paper",
                  border: `2px solid ${isDark ? "#444" : "#e0e0e0"}`,
                  transition: "transform 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            </Box>
          );
        },
      },
      {
        accessorKey: "nombre_producto",
        header: "Producto",
        size: 200,
        Cell: ({ cell }) => {
          return (
            <Typography sx={{ fontWeight: 600 }}>
              {cell.getValue()}
            </Typography>
          );
        },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        size: 250,
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
      },
      {
        accessorFn: (row) => {
          return (
            row?.sub_category?.category?.nombre_categoria ||
            row?.category?.nombre_categoria ||
            ""
          );
        },
        id: "category_name",
        header: "Categoría",
        size: 150,
        Cell: ({ cell }) => {
          return (
            <Chip
              label={cell.getValue() || "Sin categoría"}
              sx={{
                background: "background.paper",
                color: isDark ? "#eaa8f5" : "#a12c7f",
                fontWeight: 600,
              }}
            />
          );
        },
      },
      {
        accessorKey: "sub_category_id",
        header: "Subcategoría",
        size: 150,
        Cell: ({ row }) => {
          return (
            <Typography variant="body2" sx={{ color: isDark ? "#aaa" : "#666" }}>
              {row.original?.sub_category?.nombre || "—"}
            </Typography>
          );
        },
      },
      {
        accessorKey: "discount_id",
        header: "Descuento",
        size: 180,
        Cell: ({ row }) => {
          if (row.original?.discount) {
            const discountLabel = `${row.original.discount.nombre} (${row.original.discount.tipo === "porcentaje"
              ? `${row.original.discount.valor}%`
              : `$${row.original.discount.valor}`
              })`;

            return (
              <Chip
                label={discountLabel}
                sx={{
                  background: "#fef3c7",
                  color: "#92400e",
                  fontWeight: 600,
                }}
              />
            );
          }

          return (
            <Typography variant="body2" sx={{ color: isDark ? "#aaa" : "#999" }}>
              Sin descuento
            </Typography>
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

          if (priceDiscount && priceDiscount < priceOriginal) {
            return (
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#dc2626", fontSize: "1.1em" }}>
                  {formatCOP(priceDiscount)}
                </Typography>
                <Typography
                  sx={{ textDecoration: "line-through", color: "#64748b", fontSize: "0.9em" }}
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
            );
          }

          return (
            <Typography sx={{ fontWeight: 700, color: "#2563eb", fontSize: "1.1em" }}>
              {formatCOP(priceOriginal)}
            </Typography>
          );
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
      },
    ],
    [isDark]
  );
};