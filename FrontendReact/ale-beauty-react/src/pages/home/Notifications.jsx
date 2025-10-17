import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

export default function Notificaciones() {
  const [token, setToken] = React.useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [destinatario, setDestinatario] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("No está autenticado");
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setExito("");
    try {
      const res = await fetch("https://localhost:4000/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: destinatario,
          title: title,
          message: message,
        }),
      });
      if (!res.ok) throw new Error();
      setExito("¡Notificación enviada!");
      setTitle("");
      setMessage("");
      setDestinatario("");
    } catch (err) {
      setError("Error al enviar la notificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
        p: 3,
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          width: "900px",
          maxWidth: 900,
          height: "440px",
          maxHeight: "900px",
          p: 3, 
          backgroundColor: "#ffffff",
          boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.1)", // ✨ sombra elegante
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
            sx={{ color: "#c77083ff" }}
          >
            Enviar Notificación
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Destinatario</InputLabel>
              <Select
                value={destinatario}
                label="Destinatario"
                onChange={(e) => setDestinatario(e.target.value)}
                required
              >
                <MenuItem value="">Selecciona un usuario</MenuItem>
                <MenuItem value="all">Todos los usuarios</MenuItem>
                {usuarios.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.email || u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{
                mb: 3,
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Mensaje"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              variant="outlined"
              sx={{
                mb: 3,
                display: "block",
                "& .MuiInputBase-root": {
                  alignItems: "flex-start", // 👈 evita que suba el label
                  borderRadius: 2,
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
                "& .MuiInputBase-inputMultiline": {
                  padding: 0, // elimina padding interno duplicado
                },
              }}
            />


            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              disabled={enviando}
              sx={{
                py: 1.2,
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(199, 112, 131, 0.4)",
                background: "linear-gradient(90deg, #c77083ff, #fda2cdff)",
                border: "none",
                outline: "none",
                "&:hover": {
                  background: "linear-gradient(90deg, #b65b73, #f27fb9)",
                  boxShadow: "0px 6px 16px rgba(199, 112, 131, 0.5)",
                },
                "&:focus": {
                  outline: "none",
                },
                "&:focus-visible": {
                  outline: "none", // 👈 quita la línea negra del foco
                },
              }}
            >
              {enviando ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Enviar"
              )}
            </Button>


            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            {exito && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {exito}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
