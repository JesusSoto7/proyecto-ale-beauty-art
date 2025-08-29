import { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import CheckoutShippingAddress from "../../components/CheckoutShippingAddress";
import CheckoutPago from "../../components/CheckoutPago";

const steps = ["Dirección de envío", "Pago"];

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#fff0f6", // Fondo rosado muy suave
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
        {/* Título */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "#d63384", // Rosa fuerte
          }}
        >
          Verificar
        </Typography>

        {/* Stepper rosado */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            "& .MuiStepIcon-root": {
              color: "#f8bbd0", // Rosa claro por defecto
            },
            "& .MuiStepIcon-root.Mui-active": {
              color: "#ec407a", // Rosa intenso cuando está activo
            },
            "& .MuiStepIcon-root.Mui-completed": {
              color: "#d63384", // Rosa fuerte cuando completado
            },
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

        {/* Contenido de steps */}
        <Box sx={{ mt: 4 }}>
          <div style={{ display: activeStep === 0 ? "block" : "none" }}>
            <CheckoutShippingAddress onNext={handleNext} />
          </div>

          <div style={{ display: activeStep === 1 ? "block" : "none" }}>
            <CheckoutPago onNext={handleNext} onBack={handleBack} />
          </div>
        </Box>

        {/* Botones globales */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
          }}
        >
          <Button
            disabled={activeStep === 0}
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
            Atrás
          </Button>
          {activeStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              variant="contained"
              sx={{
                bgcolor: "#ec407a",
                "&:hover": {
                  bgcolor: "#d63384",
                },
              }}
            >
              Siguiente
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
