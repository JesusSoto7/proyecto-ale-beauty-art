import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Stepper, Step, StepLabel, Button, Box, Paper, Typography,
} from "@mui/material";
import GuestShippingAddress from "./GuestShippingAddress";
import GuestPago from "./GuestPago";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";

export default function GuestCheckout() {
  const { state } = useLocation() || {};
  const guestCart = state?.guestCart;
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [order, setOrder] = useState(null);
  const [creating, setCreating] = useState(false);

  const steps = [
    t("checkout.shippingAddressStep"),
    t("checkout.paymentStep")
  ];

  const shipping = 10000;
  const total = useMemo(() => {
    const items = guestCart?.products || [];
    const sum = items.reduce((acc, p) => {
      const price = p.precio_con_mejor_descuento && p.precio_con_mejor_descuento < p.precio_producto
        ? p.precio_con_mejor_descuento
        : p.precio_producto;
      return acc + price * p.cantidad;
    }, 0);
    return sum + shipping;
  }, [guestCart]);

  const createGuestOrder = async (addr) => {
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/guest_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            customer: {
              name: addr.name,
              email: addr.email,
              phone: addr.phone,
              address: addr.address,
            },
            products: (guestCart?.products || []).map(p => ({
              product_id: p.product_id,
              quantity: p.cantidad,
            })),
          },
        }),
      });
      if (!res.ok) throw new Error("No se pudo crear la orden");
      const data = await res.json();
      setOrder({ id: data.order.id, total: data.order.total || data.order.pago_total || total });
      setActiveStep(1);
    } catch (e) {
      alert(t("checkout.orderCreationError") || "No se pudo crear la orden");
    } finally {
      setCreating(false);
    }
  };

  const handleNextFromAddress = async () => {
    if (!address) return;
    await createGuestOrder(address);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#ffffffff",
        p: 3,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: { xs: "100%", sm: "90%", md: "70%", lg: "60%" },
          p: 4,
          borderRadius: 3,
          bgcolor: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#d63384",
          }}
        >
          {t("checkout.title")}
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            "& .MuiStepIcon-root": { color: "#f8bbd0" },
            "& .MuiStepIcon-root.Mui-active": { color: "#ec407a" },
            "& .MuiStepIcon-root.Mui-completed": { color: "#d63384" },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontWeight: "500",
                    color: "#ad1457",
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {/* Paso 1: Dirección (guest) */}
          <div style={{ display: activeStep === 0 ? "block" : "none" }}>
            <GuestShippingAddress
              initialData={address}
              onComplete={(addr) => setAddress(addr)}
            />
          </div>

          {/* Paso 2: Pago (guest) */}
          <div style={{ display: activeStep === 1 ? "block" : "none" }}>
            <GuestPago order={order} guestCart={guestCart} />
          </div>
        </Box>

        {/* Botones */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{
                borderColor: "#ec407a",
                color: "#ec407a",
                "&:hover": {
                  borderColor: "#d63384",
                  bgcolor: "#fce4ec",
                },
              }}
            >
              {t("checkout.backButton")}
            </Button>
          )}

          {activeStep === 0 && (
            <Button
              onClick={handleNextFromAddress}
              variant="contained"
              disabled={!address || creating}
              sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d63384" } }}
            >
              {creating ? (t("common.loading") || "Creando...") : t("checkout.continueButton")}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}