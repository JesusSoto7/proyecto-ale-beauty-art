import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const AdminProfile = ({ onLogout }) => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", email: "", telefono: "" });
  const [editLoading, setEditLoading] = useState(false);

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
    setOpenEditModal(true);
  };

  // Handle closing modal
  const handleCloseEdit = () => setOpenEditModal(false);

  // Handle form changes
  const handleFieldChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle save profile
  const handleSaveProfile = async () => {
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
    <Box sx={{ maxWidth: "1100px", mx: "auto", py: 4, px: { xs: 1, md: 6 } }}>
      {/* Header */}
      <Card sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ width: 120, height: 120, fontSize: 40 }}>
            {nombre?.charAt(0) || ""}
          </Avatar>

          <Typography variant="h3" fontWeight="bold">
            {nombre} {apellido}
          </Typography>

          <Chip
            label={roles?.join(", ")}
            color="primary"
            variant="filled"
            icon={<AccountCircleIcon />}
            sx={{ fontSize: 18, py: 1, px: 2 }}
          />

          <Typography variant="h6" color="text.secondary">
            {email}
          </Typography>
          {telefono && (
            <Typography variant="body1" color="text.secondary">
              Teléfono: {telefono}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenEdit}
              sx={{ fontSize: 16, py: 1.2, px: 4 }}
            >
              Editar Perfil
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{ fontSize: 16, py: 1.2, px: 4 }}
            >
              Cerrar Sesión
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Estadísticas del Admin */}
      <Typography variant="h4" sx={{ mt: 5, mb: 3 }}>
        Actividad del Administrador
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Órdenes de hoy
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              0
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Usuarios nuevos
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              0
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Productos con poco stock
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              0
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para editar perfil */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Perfil de Administrador</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
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