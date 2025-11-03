import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService.js";
import { useAlert } from "./AlertProvider.jsx";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Container,
  Avatar
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';

function AdminLoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  const validateFields = () => {
    let isValid = true;

    if (!email) {
      setEmailError("El correo es obligatorio.");
      isValid = false;
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      setEmailError("El correo no tiene un formato válido.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Debe tener al menos 6 caracteres.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFields()) return;

    setLoading(true);
    try {
      const data = await login({ email, password });
      
      // Verificar que el usuario sea admin
      if (!data.user.roles.includes("admin")) {
        addAlert("Acceso denegado. Solo administradores pueden acceder.", "error");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.user.roles));
      
      if (onLogin) onLogin();
      addAlert("Bienvenido al panel de administración", "success");
      navigate("/es/home");
    } catch (err) {
      addAlert(err.message || "Error al iniciar sesión.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255,255,255,0.95)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                width: 56,
                height: 56
              }}
            >
              <AdminPanelSettings fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
              Panel de Administración
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Acceso exclusivo para administradores
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
              margin="normal"
              autoComplete="email"
              autoFocus
              variant="outlined"
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                }
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 Ale Beauty Art - Panel Administrativo
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default AdminLoginForm;