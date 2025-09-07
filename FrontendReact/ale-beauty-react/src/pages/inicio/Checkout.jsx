import { useState } from "react";
import { useTranslation } from 'react-i18next';
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

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);
  const [hasAddress, setHasAddress] = useState(false);
  const { t } = useTranslation();

  const steps = [
    t('checkout.shippingAddressStep'),
    t('checkout.paymentStep')
  ];

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
          {t('checkout.title')}
        </Typography>

        {/* Stepper */}
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

        {/* Contenido */}
        <Box sx={{ mt: 4 }}>
          <div style={{ display: activeStep === 0 ? "block" : "none" }}>
            <CheckoutShippingAddress onAddressSelected={setHasAddress} />
          </div>

          <div style={{ display: activeStep === 1 ? "block" : "none" }}>
            <CheckoutPago onNext={handleNext} onBack={handleBack} />
          </div>
        </Box>

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 4,
            gap: 2,
          }}
        >
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
              {t('checkout.backButton')}
            </Button>
          )}

          {/* 👇 Mostrar Continuar solo si hay dirección */}
          {activeStep < steps.length - 1 && hasAddress && (
            <Button
              onClick={handleNext}
              variant="contained"
              sx={{
                bgcolor: "#ec407a",
                "&:hover": { bgcolor: "#d63384" },
              }}
            >
              {t('checkout.continueButton')}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}