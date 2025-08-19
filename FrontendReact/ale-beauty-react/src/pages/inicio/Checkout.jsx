import { useState } from "react";
import { Stepper, Step, StepLabel, Button, Box } from "@mui/material";
import CheckoutShippingAddress from "../../components/CheckoutShippingAddress";
import CheckoutPago from "../../components/CheckoutPago";
import CheckoutSuccess from "../../components/CheckoutSuccess";

const steps = ["Dirección de envío", "Pago"];

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Contenido de steps sin desmontar */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: activeStep === 0 ? "block" : "none" }}>
          <CheckoutShippingAddress onNext={handleNext} />
        </div>

        <div style={{ display: activeStep === 1 ? "block" : "none" }}>
          <CheckoutPago onNext={handleNext} onBack={handleBack} />
        </div>

      </div>

      {/* Botones globales opcionales */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Atrás
        </Button>
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext}>Siguiente</Button>
        )}
      </Box>
    </Box>
  );
}
