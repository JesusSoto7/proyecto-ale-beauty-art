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
  Grid,
  Paper,
  Divider,
  Avatar,
  Stack,
  Chip,
  Fade,
} from "@mui/material";
import {
  Send as SendIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  MailOutline as MailOutlineIcon,
  TitleOutlined as TitleOutlinedIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

const HISTORIAL_STORAGE_KEY = "notificaciones_historial";

export default function Notificaciones() {
  const [token, setToken] = React.useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [destinatario, setDestinatario] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [stats, setStats] = useState({ total_usuarios: 0, total_notificaciones: 0, tasa_entrega: 100 });
  const [historial, setHistorial] = useState([]);

  React.useEffect(() => {
    const savedHistorial = localStorage.getItem(HISTORIAL_STORAGE_KEY);
    if (savedHistorial) {
      try {
        setHistorial(JSON.parse(savedHistorial));
      } catch (e) {
        console.error("Error al cargar historial:", e);
        setHistorial([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(historial));
  }, [historial]);

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

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/notifications/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => console.error("Error al cargar estadísticas"));
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
      
      let nombreDestinatario = "Todos los usuarios";
      if (destinatario !== "all") {
        const usuario = usuarios.find(u => u.id == destinatario);
        nombreDestinatario = usuario?.email || usuario?.name || "Usuario";
      }

      const nuevaNotificacion = {
        id: Date.now(),
        titulo: title,
        mensaje: message,
        destinatario: nombreDestinatario,
        fecha: new Date().toLocaleString("es-ES"),
        estado: "Enviada",
      };
      
      setHistorial([nuevaNotificacion, ...historial]);
      setExito("¡Notificación enviada exitosamente!");
      
      fetch("https://localhost:4000/api/v1/notifications/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStats(data));

      setTitle("");
      setMessage("");
      setDestinatario("");

      setTimeout(() => setExito(""), 3000);
    } catch (err) {
      setError("Error al enviar la notificación.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          body {
            scrollbar-width: none;
          }
          body::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #b3bad6ff 0%, #d16fa073 100%)",
          backgroundAttachment: "fixed",
          p: 0,
          m: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {/* Container Principal */}
        <Box 
          sx={{ 
            flex: 1, 
            p: 4, 
            overflow: "auto",
            display: "flex", 
            flexDirection: "column",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Box sx={{ maxWidth: "1400px", margin: "0 auto", width: "100%", flexShrink: 0 }}>
            {/* Header */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
                  <NotificationsIcon sx={{ fontSize: 45, color: "#fff" }} />
                  <Typography
                    variant="h3"
                    fontWeight="800"
                    sx={{
                      color: "#fff",
                      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                  >
                    Panel de Notificaciones
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem" }}>
                  Administra y envía notificaciones a tus usuarios de forma centralizada
                </Typography>
              </Box>
            </Fade>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1000}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(102, 126, 234, 0.7) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          width: 60,
                          height: 60,
                        }}
                      >
                        <PeopleIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">
                          {stats.total_usuarios}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                          Usuarios Totales
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1200}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(240, 147, 251, 0.9) 0%, rgba(240, 147, 251, 0.7) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          width: 60,
                          height: 60,
                        }}
                      >
                        <SendIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">
                          {stats.total_notificaciones}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                          Notificaciones Enviadas
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1400}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(76, 175, 80, 0.7) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          width: 60,
                          height: 60,
                        }}
                      >
                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">
                          {stats.tasa_entrega}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                          Tasa de Entrega
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1600}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, rgba(255, 193, 7, 0.9) 0%, rgba(255, 193, 7, 0.7) 100%)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          width: 60,
                          height: 60,
                        }}
                      >
                        <HistoryIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">
                          {historial.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                          En esta sesión
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>

            {/* Main Content Grid - Centrado */}
            <Grid container spacing={4} sx={{ justifyContent: "center" }}>
              {/* Form Card */}
              <Grid item xs={12} lg={5.5}>
                <Fade in timeout={1800}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(30px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 5, overflowY: "auto", maxHeight: "calc(100vh - 400px)", scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Box
                          sx={{
                            width: 5,
                            height: 35,
                            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: 2,
                            mr: 2,
                          }}
                        />
                        <SendIcon sx={{ color: "#667eea", fontSize: 28, mr: 1 }} />
                        <Typography variant="h5" fontWeight="800" color="#333">
                          Enviar Nueva Notificación
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 4, background: "rgba(0,0,0,0.05)" }} />

                      <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3.5}>
                          {/* Campo Destinatario */}
                          <FormControl
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                bgcolor: "#f8f9fa",
                                border: "2px solid transparent",
                                height: "56px",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  bgcolor: "#fff",
                                  borderColor: "#667eea",
                                },
                                "&.Mui-focused": {
                                  bgcolor: "#fff",
                                  borderColor: "#667eea",
                                  boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                },
                              },
                            }}
                          >
                            <InputLabel>Destinatario</InputLabel>
                            <Select
                              value={destinatario}
                              label="Destinatario"
                              onChange={(e) => setDestinatario(e.target.value)}
                              required
                            >
                              <MenuItem value="">Selecciona un usuario</MenuItem>
                              <MenuItem value="all">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <PeopleIcon fontSize="small" sx={{ color: "#667eea" }} />
                                  <strong>Todos los usuarios</strong>
                                </Box>
                              </MenuItem>
                              {usuarios.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                  <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
                                  {u.email || u.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {/* Campo Título */}
                          <TextField
                            fullWidth
                            label="Título de la Notificación"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Ej: Actualización importante del sistema"
                            InputProps={{
                              startAdornment: <TitleOutlinedIcon sx={{ mr: 1, color: "#667eea" }} />,
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                bgcolor: "#f8f9fa",
                                border: "2px solid transparent",
                                height: "56px",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  bgcolor: "#fff",
                                  borderColor: "#667eea",
                                },
                                "&.Mui-focused": {
                                  bgcolor: "#fff",
                                  borderColor: "#667eea",
                                  boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                },
                              },
                            }}
                          />

                          {/* Campo Mensaje */}
                          <Box>
                            <TextField
                              fullWidth
                              multiline
                              rows={12}
                              label="Mensaje"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              required
                              placeholder="Escribe aquí el contenido detallado de tu notificación... Puedes usar múltiples párrafos para describir con claridad el mensaje."
                              InputLabelProps={{
                                shrink: true,
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2.5,
                                  bgcolor: "#f8f9fa",
                                  border: "2px solid transparent",
                                  alignItems: "flex-start",
                                  minHeight: "280px",
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    bgcolor: "#fff",
                                    borderColor: "#667eea",
                                  },
                                  "&.Mui-focused": {
                                    bgcolor: "#fff",
                                    borderColor: "#667eea",
                                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                                  },
                                },
                                "& .MuiInputBase-inputMultiline": {
                                  padding: "16px 14px",
                                  fontSize: "1rem",
                                  lineHeight: "1.6",
                                  resize: "vertical",
                                },
                                "& .MuiInputLabel-root": {
                                  backgroundColor: "#fff",
                                  px: 0.5,
                                },
                              }}
                            />
                          </Box>

                          {/* Botón Enviar */}
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={enviando}
                            startIcon={enviando ? null : <SendIcon />}
                            sx={{
                              py: 2,
                              borderRadius: 2.5,
                              textTransform: "none",
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                boxShadow: "0 8px 30px rgba(102, 126, 234, 0.6)",
                                transform: "translateY(-3px)",
                              },
                              "&:active": {
                                transform: "translateY(-1px)",
                              },
                              "&:disabled": {
                                background: "#ccc",
                                boxShadow: "none",
                              },
                            }}
                          >
                            {enviando ? (
                              <>
                                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                Enviando...
                              </>
                            ) : (
                              "Enviar Notificación"
                            )}
                          </Button>

                          {/* Alertas */}
                          {error && (
                            <Fade in={!!error}>
                              <Alert
                                severity="error"
                                sx={{
                                  borderRadius: 2.5,
                                  "& .MuiAlert-icon": {
                                    fontSize: 28,
                                  },
                                  background: "linear-gradient(135deg, #ff5252 0%, #ff1744 100%)",
                                  color: "#fff",
                                  border: "none",
                                }}
                              >
                                {error}
                              </Alert>
                            </Fade>
                          )}

                          {exito && (
                            <Fade in={!!exito}>
                              <Alert
                                severity="success"
                                sx={{
                                  borderRadius: 2.5,
                                  "& .MuiAlert-icon": {
                                    fontSize: 28,
                                  },
                                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                                  color: "#fff",
                                  border: "none",
                                }}
                              >
                                {exito}
                              </Alert>
                            </Fade>
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Historial Card */}
              <Grid item xs={12} lg={5.5}>
                <Fade in timeout={2000}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(30px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 5, overflowY: "auto", maxHeight: "calc(100vh - 400px)", scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Box
                          sx={{
                            width: 5,
                            height: 35,
                            background: "linear-gradient(180deg, #f093fb 0%, #f5af19 100%)",
                            borderRadius: 2,
                            mr: 2,
                          }}
                        />
                        <HistoryIcon sx={{ color: "#f093fb", fontSize: 28, mr: 1 }} />
                        <Typography variant="h5" fontWeight="800" color="#333">
                          Historial de Notificaciones
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 3, background: "rgba(0,0,0,0.05)" }} />

                      {historial.length === 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 12,
                            color: "#999",
                          }}
                        >
                          <MailOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.2rem" }}>
                            No hay notificaciones enviadas
                          </Typography>
                          <Typography variant="body2">
                            Las notificaciones enviadas aparecerán aquí
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2.5} sx={{ maxHeight: "calc(100vh - 550px)", overflowY: "auto", pr: 2, scrollbarWidth: "none", msOverflowStyle: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                          {historial.map((notif) => (
                            <Fade in key={notif.id}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 3,
                                  borderRadius: 2.5,
                                  background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
                                  border: "2px solid #e8ecf1",
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    borderColor: "#667eea",
                                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
                                    transform: "translateX(5px)",
                                  },
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
                                  <CheckCircleOutlineIcon
                                    sx={{
                                      color: "#4CAF50",
                                      fontSize: 32,
                                      mt: 0.5,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                      <Typography 
                                        variant="h6" 
                                        fontWeight="700" 
                                        color="#333"
                                        sx={{ wordBreak: "break-word" }}
                                      >
                                        {notif.titulo}
                                      </Typography>
                                      <Chip
                                        label={notif.estado}
                                        size="small"
                                        sx={{
                                          background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                                          color: "#fff",
                                          fontWeight: 600,
                                          flexShrink: 0,
                                        }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "#666",
                                        mb: 1.5,
                                        lineHeight: 1.6,
                                        maxHeight: "120px",
                                        overflow: "auto",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {notif.mensaje}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <PeopleIcon sx={{ fontSize: 16, color: "#999" }} />
                                        <Typography 
                                          variant="caption" 
                                          sx={{ color: "#999", fontSize: "0.85rem" }}
                                        >
                                          {notif.destinatario}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <HistoryIcon sx={{ fontSize: 16, color: "#999" }} />
                                        <Typography 
                                          variant="caption" 
                                          sx={{ color: "#999", fontSize: "0.85rem" }}
                                        >
                                          {notif.fecha}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            </Fade>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
}