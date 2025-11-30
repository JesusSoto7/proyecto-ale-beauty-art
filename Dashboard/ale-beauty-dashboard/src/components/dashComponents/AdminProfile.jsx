import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", email: "", telefono: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Validación teléfono
  const [telefonoError, setTelefonoError] = useState("");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/admin/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("No se pudo cargar el perfil");

        const data = await response.json();
        setAdminData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [apiBaseUrl]);

  // Handle opening modal and pre-fill values
  const handleOpenEdit = () => {
    setEditForm({
      nombre: adminData?.nombre || "",
      apellido: adminData?.apellido || "",
      email: adminData?.email || "",
      telefono: adminData?.telefono || "",
    });
    setTelefonoError("");
    setOpenEditModal(true);
  };

  // Handle closing modal
  const handleCloseEdit = () => setOpenEditModal(false);

  // Handle form changes
  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    // Validación para teléfono usando sólo números
    if (name === "telefono") {
      // Sólo admite números
      const cleanedValue = value.replace(/\D/g, "");
      setEditForm({ ...editForm, [name]: cleanedValue });

      if (cleanedValue.length < 10) {
        setTelefonoError("El número debe tener 10 dígitos.");
      } else if (cleanedValue.length > 10) {
        setTelefonoError("No puede tener más de 10 dígitos.");
      } else {
        setTelefonoError("");
      }
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    // Validación antes de enviar
    if (editForm.telefono.length !== 10) {
      setTelefonoError("El número debe tener exactamente 10 dígitos.");
      return;
    }

    setEditLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin: editForm }),
      });
      if (!response.ok) throw new Error("Error al guardar los cambios");

      const updatedData = await response.json();
      setAdminData(updatedData);
      setOpenEditModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Cargando perfil...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const { nombre, apellido, email, telefono, roles } = adminData || {};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Card
        sx={{
          p: { xs: 8, md: 12 },
          borderRadius: 10,
          boxShadow: 12,
          minWidth: { xs: 380, md: 700, lg: 950 },
          maxWidth: { xs: "98vw", md: "60vw", lg: "45vw" },
          minHeight: { xs: 440, md: 600, lg: 680 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={6} alignItems="center" sx={{ width: "100%" }}>
          <Avatar sx={{ width: 230, height: 230, fontSize: 100 }}>
            {nombre?.charAt(0) || ""}
          </Avatar>
          <Typography variant="h2" fontWeight="bold" align="center">
            {nombre} {apellido}
          </Typography>
          <Chip
            label={roles?.includes('admin') ? 'Administrador' : ''}
            color="primary"
            variant="filled"
            icon={<AccountCircleIcon />}
            sx={{ fontSize: 32, py: 2.2, px: 5 }}
          />
          <Typography variant="h4" color="text.secondary" align="center">
            {email}
          </Typography>
          {telefono && (
            <Typography variant="h5" color="text.secondary" align="center">
              Teléfono: {telefono}
            </Typography>
          )}
          <Stack direction="row" spacing={4} sx={{ mt: 2, width: "100%", justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenEdit}
              sx={{ fontSize: 26, py: 2.2, px: 9 }}
            >
              Editar Perfil
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Modal para editar perfil */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Perfil de Administrador</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={editForm.nombre}
              onChange={handleFieldChange}
              fullWidth
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={editForm.apellido}
              onChange={handleFieldChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={editForm.email}
              onChange={handleFieldChange}
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="telefono"
              value={editForm.telefono}
              onChange={handleFieldChange}
              error={Boolean(telefonoError)}
              helperText={telefonoError}
              inputProps={{
                maxLength: 10,
                inputMode: "numeric",
                pattern: "[0-9]*"
              }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={editLoading}
          >
            {editLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfile;