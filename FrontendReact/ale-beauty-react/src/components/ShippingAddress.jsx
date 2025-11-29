import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// Componentes de Material-UI
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Stack,
  CircularProgress, // Para el indicador de carga
  Checkbox,
  Divider,
} from "@mui/material";
import Chip from '@mui/material/Chip';

// Iconos de Material-UI
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline'; // Usado como icono sin marcar

// Importa tu formulario (asegúrate de que la ruta sea correcta)
import ShippingAddressForm from "./ShippingAddressForm";

function ShippingAddresses() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { lang } = useParams();
  const { t } = useTranslation();

  // URL base de la API (es importante definirla)
  const API_BASE = "https://localhost:4000/api/v1";

  // 1. Obtener Token al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      // Nota: Considera usar un componente de notificación en lugar de alert()
      alert(t('shippingAddresses.notAuthenticated'));
      // Podrías redirigir al login aquí: navigate(`/${lang}/login`);
    }
  }, [t]);

  // 2. Cargar Direcciones al tener el Token
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/shipping_addresses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(t('shippingAddresses.loadError'));
        }
        return res.json();
      })
      .then(data => {
        // console.log("Direcciones recibidas:", data);
        setAddresses(data);
        if (data.length === 0) {
          setShowForm(true); // Mostrar formulario si no hay direcciones
        }
      })
      .catch(error => {
        console.error(error);
        setAddresses([]);
        setShowForm(true);
      });
  }, [token, t]);

  // 3. Manejar "Establecer como Predeterminada"
  const handleSetPredeterminada = async (id) => {
    // Optimistic update
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id
          ? { ...addr, predeterminada: true }
          : { ...addr, predeterminada: false }
      )
    );

    try {
      const res = await fetch(`${API_BASE}/shipping_addresses/${id}/set_predeterminada`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(t('shippingAddresses.updateError'));
      // No necesitamos re-fetch si el optimistic update fue exitoso

    } catch (error) {
      console.error(error);
      alert(t('shippingAddresses.updateFailed'));

      // Rollback del estado si falla
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === id
            ? { ...addr, predeterminada: false }
            : addr // Mantenemos el estado anterior
        )
      );
    }
  }

  // 4. Manejar "Eliminar Dirección"
  const handleDelete = async (id) => {
    if (!window.confirm(t('shippingAddresses.confirmDelete'))) return;

    try {
      const res = await fetch(`${API_BASE}/shipping_addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(t('shippingAddresses.deleteError'));

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      // alert(t('shippingAddresses.deleteSuccess')); // Opcional
    } catch (error) {
      console.error(error);
      alert(t('shippingAddresses.deleteFailed'));
    }
  };

  // 5. Manejar éxito del Formulario
  const handleFormSuccess = (savedAddress, isEditing) => {
    if (isEditing) {
      // Si la dirección editada se establece como predeterminada, actualiza las demás
      const updatedAddresses = addresses.map(addr => {
        if (addr.id === savedAddress.id) {
          return savedAddress;
        }
        // Si la dirección guardada es predeterminada, desactiva la predeterminada en el resto
        if (savedAddress.predeterminada) {
          return { ...addr, predeterminada: false };
        }
        return addr;
      });
      setAddresses(updatedAddresses);

    } else {
      // Si es una nueva dirección, añade y desactiva las demás si es predeterminada
      let newAddresses = [...addresses, savedAddress];
      if (savedAddress.predeterminada) {
        newAddresses = newAddresses.map(addr =>
          addr.id === savedAddress.id ? addr : { ...addr, predeterminada: false }
        );
      }
      setAddresses(newAddresses);
    }

    setShowForm(false);
    setEditAddress(null);
  };


  // 6. Vista de Carga
  if (addresses === null) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        gap: 2,
        mt: 10
      }}>
        <CircularProgress sx={{ color: '#ff4d94' }} size={60} thickness={4} />
        <Typography variant="body1">{t('shippingAddresses.loading')}</Typography>
      </Box>
    );
  }

  // 7. Renderizado Principal
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 800,
        mx: "auto",
        mt: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {/* --------------------- FORMULARIO DE EDICIÓN / CREACIÓN --------------------- */}
      {showForm ? (
        <Box>
          <ShippingAddressForm
            token={token}
            onSuccess={handleFormSuccess}
            initialData={editAddress}
          // Puedes añadir props de estilo si tu formulario las soporta
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setShowForm(false);
              setEditAddress(null);
            }}
            sx={{ mt: 2 }}
          >
            {t('shippingAddresses.cancel')}
          </Button>
        </Box>
      ) : (
        /* --------------------- LISTA DE DIRECCIONES --------------------- */
        <Box>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 'bold',
              color: '#ff4d94',
            }}
          >
            {t('shippingAddresses.myAddresses')}
          </Typography>

          {addresses.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {t('shippingAddresses.noAddresses')}
            </Typography>
          ) : (
            <Stack spacing={3} mb={4}>
              {addresses.map((addr) => (
                <Card
                  key={addr.id}
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: addr.predeterminada ? 4 : 1,
                    borderColor: addr.predeterminada ? '#ff4d94' : 'divider',
                    borderWidth: addr.predeterminada ? 2 : 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { boxShadow: addr.predeterminada ? 6 : 3 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 30, color: addr.predeterminada ? '#ff4d94' : 'text.secondary', mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                        {addr.nombre} {addr.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {addr.direccion} — {t('shippingAddresses.neighborhood')}: {addr.neighborhood?.nombre || 'N/A'}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        {/* Checkbox para establecer como predeterminada */}
                        <Checkbox
                          checked={addr.predeterminada}
                          onChange={() => handleSetPredeterminada(addr.id)}
                          disabled={addr.predeterminada}
                          icon={<StarOutlineIcon />}
                          checkedIcon={<CheckCircleOutlineIcon />}
                          sx={{
                            color: '#ff4d94',
                            '&.Mui-checked': { color: '#ff4d94' },
                            '&.Mui-disabled': { color: '#ff4d94' },
                          }}
                        />
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 'medium' }}>
                          {t('shippingAddresses.default')}
                        </Typography>

                        {/* Chip de estado */}
                        {addr.predeterminada && (
                          <Chip
                            label={t('shippingAddresses.active')}
                            size="small"
                            color="primary"
                            variant="filled"
                            icon={<CheckCircleOutlineIcon />}
                            sx={{ backgroundColor: '#ff4d94', color: 'white' }}
                          />
                        )}

                        {/* Botones de acción */}
                        <Button
                          variant="text"
                          startIcon={<ModeEditOutlineIcon />}
                          onClick={() => {
                            setEditAddress(addr);
                            setShowForm(true);
                          }}
                          sx={{ color: '#ff4d94', '&:hover': { backgroundColor: 'rgba(255, 77, 148, 0.1)' } }}
                        >
                          {t('shippingAddresses.edit')}
                        </Button>

                        {/* Solo permitir eliminar si NO es la dirección predeterminada */}
                        {!addr.predeterminada && (
                          <Button
                            variant="text"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(addr.id)}
                            color="error"
                          >
                            {t('shippingAddresses.delete')}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}

          {/* Botón para Añadir Dirección */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<AddLocationAltIcon />}
            onClick={() => {
              setShowForm(true);
              setEditAddress(null);
            }}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: '#ff4d94',
              '&:hover': { backgroundColor: '#ff6b9c', boxShadow: 6, transform: 'translateY(-1px)' },
              boxShadow: 3,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {t('shippingAddresses.addNewAddress')}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default ShippingAddresses;