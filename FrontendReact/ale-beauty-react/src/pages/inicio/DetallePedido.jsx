import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatCOP } from "../../services/currency";
import "../../assets/stylesheets/DetallePedido.css";
import noImage from "../../assets/images/no_image.png";
import CircularProgress from "@mui/material/CircularProgress";

import {
  Box,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Typography,
  StepConnector,
  stepConnectorClasses
} from "@mui/material";
import { styled } from "@mui/material/styles";

import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import PaymentIcon from "@mui/icons-material/Payment";
import BuildIcon from "@mui/icons-material/Build";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HomeIcon from "@mui/icons-material/Home";
import CancelIcon from "@mui/icons-material/Cancel";

// Cambia a http:// si tu backend no usa TLS en dev
const API_BASE = "https://localhost:4000";

const STEPS = [
  { key: "pendiente", label: "Pendiente", Icon: ShoppingCartCheckoutIcon },
  { key: "pagada", label: "Pagada", Icon: PaymentIcon },
  { key: "preparando", label: "Preparando", Icon: BuildIcon },
  { key: "enviado", label: "Enviado", Icon: LocalShippingIcon },
  { key: "entregado", label: "Entregado", Icon: HomeIcon },
];

const PinkConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 14,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === "dark" ? "#444" : "#e5e7eb",
    borderRadius: 2,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundColor: "#ff4d94",
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    backgroundColor: "#ff4d94",
  },
}));

// Icono: lleno rosa cuando completed=true
function StatusStepIcon(props) {
  const { active, completed, icon } = props;
  const idx = Number(icon) - 1;
  const StepIconCmp = STEPS[idx]?.Icon || ShoppingCartCheckoutIcon;

  return (
    <Box
      sx={{
        color: completed ? "#fff" : active ? "#ff4d94" : "#9ca3af",
        backgroundColor: completed ? "#ff4d94" : active ? "#fff" : "#f3f4f6",
        border: active && !completed ? "2px solid #ff4d94" : "2px solid transparent",
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: completed ? "0 0 0 2px rgba(255,77,148,0.2)" : "none",
      }}
    >
      <StepIconCmp sx={{ fontSize: 16 }} />
    </Box>
  );
}

const statusChipProps = (status) => {
  switch (status) {
    case "pagada":
      return { color: "success", variant: "outlined" };
    case "pendiente":
      return { color: "default", variant: "outlined" };
    case "preparando":
      return { color: "info", variant: "outlined" };
    case "enviado":
      return { color: "primary", variant: "outlined" };
    case "entregado":
      return { variant: "filled", sx: { bgcolor: "#ff4d94", color: "#fff", borderColor: "#ff4d94" } };
    case "cancelada":
      return { color: "error", variant: "filled", icon: <CancelIcon /> };
    default:
      return { color: "default", variant: "outlined" };
  }
};

export default function DetallePedido() {
  const { id, lang } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString(
        lang === "en" ? "en-US" : "es-CO",
        { day: "2-digit", month: "2-digit", year: "numeric" }
      );
    } catch {
      return "—";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString(
        lang === "en" ? "en-US" : "es-CO",
        { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
      );
    } catch {
      return "—";
    }
  };

  const fetchOrder = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t("orderDetail.notAuthenticated"));
      setLoading(false);
      return;
    }

    return fetch(`${API_BASE}/api/v1/my_orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${t("orderDetail.error")} ${res.status}`);
        return res.json();
      })
      .then((data) => setPedido(data.order ? data.order : data))
      .catch(() => setError(t("orderDetail.loadFailed")))
      .finally(() => setLoading(false));
  }, [id, t]);

  useEffect(() => {
    setLoading(true);
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!pedido) return;
    const final = ["entregado", "cancelada"].includes((pedido.status || "").toLowerCase());
    if (final) return;
    const int = setInterval(() => fetchOrder(), 15000);
    return () => clearInterval(int);
  }, [pedido, fetchOrder]);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-16 flex items-center justify-center">
          <CircularProgress style={{ color: "#ff4d94" }} aria-label={t("orderDetail.loading")} />
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!pedido) return <p className="text-red-500">{t("orderDetail.notFound")}</p>;

  // Prefer server-provided breakdowns if available
  const subTotal = Number(pedido.subtotal_sin_iva ?? (pedido.productos || []).reduce((acc, p) => {
    const cantidad = Number(p.cantidad || 0);
    const precio = Number(p.precio_descuento || p.precio_unitario || p.precio_producto || 0);
    return acc + cantidad * precio;
  }, 0));

  const ivaTotal = Number(pedido.iva_total ?? (pedido.productos || []).reduce((acc, p) => {
    const cantidad = Number(p.cantidad || 0);
    const ivaLine = Number(p.iva_line ?? 0);
    if (ivaLine > 0) return acc + ivaLine;
    const precio = Number(p.precio_descuento || p.precio_unitario || p.precio_producto || 0);
    return acc + precio * 0.19 * cantidad;
  }, 0));

  const envio = Number(pedido.envio ?? pedido.costo_de_envio ?? 10000);
  const total = Number(pedido.total ?? pedido.pago_total ?? (subTotal + ivaTotal + envio));

  const status = (pedido.status || "").toLowerCase();
  const isCancelled = status === "cancelada";

  // 1) Calcula el índice del estado
  const rawIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));
  // 2) Si es "entregado", marca todos como completados (activeStep fuera de rango)
  const activeIndexNormalized = status === "entregado" ? STEPS.length : rawIndex;

  const fechaPago = pedido.fecha_pago;
  const shippedAt = pedido.shipped_at;
  const deliveredAt = pedido.delivered_at;
  const carrier = pedido.carrier;
  const tracking = pedido.tracking_number;
  const eta = pedido.estimated_delivery;

  return (
    <div className="pedido-container">
      <div className="pedido-header">
        <h2>{t("orderDetail.title")}</h2>
        <p>
          <strong>{t("orderDetail.orderNumber")}:</strong>{" "}
          {pedido.numero_de_orden ?? pedido.id}
        </p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <strong>{t("Estado")}:</strong>{" "}
          <Chip size="small" label={(status || "—").toUpperCase()} {...statusChipProps(status)} />
        </span>
      </div>

      <Box sx={{ p: 2, mb: 2, border: "1px solid #eee", borderRadius: 2 }}>
        {!isCancelled ? (
          <>
            <Stepper
              alternativeLabel
              activeStep={activeIndexNormalized}
              connector={<PinkConnector />}
              sx={{ mb: 1 }}
            >
              {STEPS.map((s, idx) => {
                const completed = idx < activeIndexNormalized; // <- reglas simples
                const optional =
                  s.key === "pagada" && fechaPago ? (
                    <Typography variant="caption">
                      {t("orderDetail.paymentDate")}: {formatDate(fechaPago)}
                    </Typography>
                  ) : s.key === "enviado" && shippedAt ? (
                    <Typography variant="caption">
                      {t("Enviado")}: {formatDateTime(shippedAt)}
                    </Typography>
                  ) : s.key === "entregado" && deliveredAt ? (
                    <Typography variant="caption">
                      {t("Entregado")}: {formatDateTime(deliveredAt)}
                    </Typography>
                  ) : undefined;

                return (
                  <Step key={s.key} completed={completed}>
                    <StepLabel
                      StepIconComponent={StatusStepIcon}
                      optional={optional}
                    >
                      {s.label}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {(status === "enviado" || status === "entregado") && (carrier || tracking || eta) && (
              <Box sx={{ mt: 2, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {carrier && (
                  <div>
                    <Typography variant="body2" color="text.secondary">Transportadora</Typography>
                    <Typography variant="body1" fontWeight={600}>{carrier}</Typography>
                  </div>
                )}
                {tracking && (
                  <div>
                    <Typography variant="body2" color="text.secondary">Tracking</Typography>
                    <Typography variant="body1" fontWeight={600}>{tracking}</Typography>
                  </div>
                )}
                {eta && (
                  <div>
                    <Typography variant="body2" color="text.secondary">Entrega estimada</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatDate(eta)}</Typography>
                  </div>
                )}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CancelIcon color="error" />
            <Typography variant="body1" color="error" fontWeight={600}>
              Pedido cancelado
            </Typography>
          </Box>
        )}
      </Box>

      <div className="pedido-info-grid">
        <div className="pedido-card">
          <h3>{t("Direccion de envio")}</h3>
          <p>{pedido.direccion_envio || t("orderDetail.noShippingAddress") || "No disponible"}</p>
        </div>

        <div className="pedido-card">
          <h3>{t("Metodo de pago")}</h3>
          {(pedido.tarjeta_tipo || pedido.tarjeta_ultimos4) ? (
            <p className="pedido-card-info">
              {pedido.tarjeta_tipo?.toUpperCase() || "Tarjeta"}
              <br />
              <span className="pedido-card-dots">••••</span>{" "}
              {pedido.tarjeta_ultimos4 || "XXXX"}
            </p>
          ) : (
            <p>{t("orderDetail.noPaymentInfo") || "No disponible"}</p>
          )}
        </div>

        <div className="pedido-card">
          <h3>{t("orderDetail.paymentDate")}</h3>
          <p>{formatDate(pedido.fecha_pago)}</p>
        </div>
      </div>

      <div className="pedido-products">
        <h3>{t("Productos adquiridos")}</h3>
        {(pedido.productos || []).map((p) => {
          const cantidad = Number(p.cantidad || 0);
          const precioOriginal = Number(p.precio_producto || 0);
          const precioDescuento = Number(p.precio_descuento || p.precio_unitario || 0);
          const tieneDescuento = p.tiene_descuento || (precioDescuento < precioOriginal);
          const porcentajeDescuento = p.porcentaje_descuento;

          const nombre = p.nombre_producto || p.product?.nombre_producto || t("orderDetail.product");
          const imagen = p.imagen_url || p.product?.imagen_url || noImage;
          const slug = p.slug || p.product?.slug;

          // Prefer server-provided line totals (subtotal/iva/total), otherwise compute locally
          const subtotalLine = Number(p.subtotal_line ?? (precioDescuento * cantidad));
          const ivaLine = Number(p.iva_line ?? (precioDescuento * 0.19 * cantidad));
          const totalLine = Number(p.total_line ?? (subtotalLine + ivaLine));

          // Per-unit price with IVA
          const precioConIvaUnit = p.precio_con_iva ?? (subtotalLine / Math.max(1, cantidad) + (ivaLine / Math.max(1, cantidad)));

          return (
            <Link key={p.id} to={`/${lang || "es"}/producto/${slug}`} className="pedido-item">
              <img src={imagen} alt={nombre} onError={(e) => (e.currentTarget.src = noImage)} />
              <div className="pedido-item-info">
                <span className="pedido-item-name">{nombre}</span>
                <span>{t("orderDetail.quantity")}: {cantidad}</span>
                {tieneDescuento && porcentajeDescuento > 0 && (
                  <span style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.9em" }}>{porcentajeDescuento}% OFF</span>
                )}
              </div>
              <div className="pedido-item-price">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    {formatCOP(totalLine)}
                  </span>
                  <span style={{ fontSize: '0.85em', color: '#666' }}>
                    {formatCOP(precioConIvaUnit)} / unidad (incl. IVA)
                  </span>
                  {tieneDescuento && (
                    <span style={{ textDecoration: "line-through", color: "#64748b", fontSize: "0.85em" }}>
                      {formatCOP((p.precio_producto_con_iva ?? (precioOriginal * 1.19)) * cantidad)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="pedido-summary">
        <div className="pedido-summary-row">
          <span>{t("orderDetail.subtotal")}:</span>
          <strong>{formatCOP(subTotal)}</strong>
        </div>
        <div className="pedido-summary-row">
          <span>IVA (19%):</span>
          <strong>{formatCOP(ivaTotal)}</strong>
        </div>
        <div className="pedido-summary-row">
          <span>{t("orderDetail.shipping")}:</span>
          <strong>{formatCOP(envio)}</strong>
        </div>
        <div className="pedido-summary-total">
          <span>{t("orderDetail.total")}:</span>
          <strong>{formatCOP(total)}</strong>
        </div>
      </div>
    </div>
  );
}