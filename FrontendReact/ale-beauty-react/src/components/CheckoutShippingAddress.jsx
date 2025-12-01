import React, { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Necesario para el pin
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Necesario para Predeterminada
import {
  Button,
  Sheet, // Usaremos Sheet para la tarjeta
  Typography, // Usaremos Typography para textos y títulos
  Chip, // Usaremos Chip para 'Activo' y 'Predeterminada'
  IconButton, // Usaremos IconButton para el botón de editar
  Box, // Usaremos Box para contenedores flexibles
} from "@mui/joy"; // Nota: Asegúrate de que estás usando @mui/joy, ya que Button y EditIcon están en tu código original.

import { useTranslation } from "react-i18next";

function CheckoutShippingAddress({ onAddressSelected }) {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();

  // Resto de lógica de useEffect (no modificada)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert(t("checkout.notAuthenticated"));
    }
  }, [t]);

  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/shipping_addresses/predeterminada", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error(`${t("checkout.errorLoadingAddress")}: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAddress(data);
        setLoading(false);
        onAddressSelected(!!data);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        onAddressSelected(false);
      });
  }, [token, onAddressSelected, t]);

  // Si la dirección no tiene un campo 'slug', usaremos el ID, o un valor por defecto.
  const addressName = `${address?.nombre || 'Nombre'} ${address?.apellido || 'Apellido'}`;
  const addressLine = `${address?.direccion || t("checkout.noAddressLine")} — ${t("checkout.neighborhood")}: ${address?.neighborhood?.nombre || t("checkout.noNeighborhood")}`;


  if (loading) return <p>{t("checkout.loadingAddress")}</p>;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        {t("checkout.shippingAddressTitle")}
      </Typography>

      {address && !isEditing ? (
        // **********************************************
        // SECCIÓN MODIFICADA: Estilo de Tarjeta de Dirección
        // **********************************************
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "md",
            border: "2px solid #ff4d94", // Borde rosa (estilo de la marca)
            boxShadow: "lg",
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "xl",
              transform: "translateY(-2px)",
            },
          }}
        >
          {/* Columna de Ícono (Pin Rosa) */}
          <LocationOnIcon sx={{ fontSize: 32, color: "#ff4d94", mt: 0.5 }} />

          {/* Columna de Información */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Nombre */}
            <Typography level="title-lg" fontWeight="bold" sx={{ mb: 0.5, color: 'text.primary' }}>
              {addressName}
            </Typography>
            {/* Dirección y Barrio */}
            <Typography level="body-md" sx={{ color: 'text.secondary', mb: 1 }}>
              {addressLine}
            </Typography>

            {/* Chips de Estado */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>

              {/* Chip Activo (Estilo Rosa) */}
              <Chip
                variant="soft"
                size="sm"
                startDecorator={<CheckCircleIcon />}
                sx={{
                  backgroundColor: 'rgba(255, 77, 148, 0.1)',
                  color: '#ff4d94',
                  fontWeight: 600,
                  borderRadius: 'md',
                  textTransform: 'uppercase'
                }}
              >
                {t("checkout.active")}
              </Chip>

              {/* Botón EDITAR */}
              <IconButton
                variant="plain"
                size="sm"
                onClick={() => setIsEditing(true)}
                sx={{
                  ml: 'auto',
                  color: '#ff4d94',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 77, 148, 0.1)',
                  }
                }}
              >
                <EditIcon fontSize="small" />
                EDITAR
              </IconButton>
            </Box>
          </Box>
        </Sheet>
      ) : (

        <Box>
          <ShippingAddressForm
            initialData={address}
            onSuccess={(newAddress) => {
              setAddress(newAddress);
              setIsEditing(false);
              onAddressSelected(true);
            }}
            onCancel={() => {
              setIsEditing(false);
              onAddressSelected(!!address);
            }}
            variant="checkout"
          />

          {address && (
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                onAddressSelected(!!address);
              }}
              color="secondary"
              sx={{ mt: 2 }} // Añadir margen superior para separar del formulario
            >
              {t("common.cancel")}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default CheckoutShippingAddress;