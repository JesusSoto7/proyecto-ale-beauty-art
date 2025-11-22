import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
} from "@mui/material";
import {
  Send as SendIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  MailOutline as MailOutlineIcon,
} from "@mui/icons-material";

import "../../assets/stylesheets/notifications.css";

const HISTORIAL_STORAGE_KEY = "notificaciones_historial";

export default function Notificaciones() {
  const [token, setToken] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [broadcast, setBroadcast] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_notificaciones: 0,
    tasa_entrega: 100,
  });
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const savedHistorial = localStorage.getItem(HISTORIAL_STORAGE_KEY);
    if (savedHistorial) {
      try {
        setHistorial(JSON.parse(savedHistorial));
      } catch {
        setHistorial([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/notifications/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => { });
  }, [token]);

  const chunkArray = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
    return res;
  };

  const filteredUsers = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        (u.email || "").toLowerCase().includes(q) ||
        (u.nombre || u.name || "").toLowerCase().includes(q) ||
        String(u.id) === q
    );
  }, [usuarios, query]);

  const pagedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const isSelected = (id) => selectedUsers.includes(id);

  const handleToggle = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = (checked) => {
    const idsOnPage = pagedUsers.map((u) => u.id);
    setSelectedUsers((prev) => {
      if (checked) return Array.from(new Set([...prev, ...idsOnPage]));
      return prev.filter((id) => !idsOnPage.includes(id));
    });
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const tryPost = async (payload) => {
    const res = await fetch("https://localhost:4000/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return {
      ok: res.ok,
      status: res.status,
      json: res.ok ? await res.json().catch(() => null) : null,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setExito("");

    if (!title.trim() || !message.trim()) {
      setError("El título y el mensaje son obligatorios.");
      setTimeout(() => setError(""), 3000);
      setEnviando(false);
      return;
    }

    if (!broadcast && selectedUsers.length === 0) {
      setError("Selecciona al menos un destinatario o activa 'Enviar a todos'.");
      setTimeout(() => setError(""), 3000);
      setEnviando(false);
      return;
    }

    try {
      if (broadcast) {
        let attempt = await tryPost({ broadcast: true, title, message });
        if (!attempt.ok) attempt = await tryPost({ user_id: "all", title, message });
        if (!attempt.ok) {
          const allIds = usuarios.map((u) => u.id);
          if (!allIds.length) throw new Error("No hay usuarios para enviar.");
          attempt = await tryPost({ user_ids: allIds, title, message });
        }
        if (!attempt.ok) {
          const allIds = usuarios.map((u) => u.id);
          for (const chunk of chunkArray(allIds, 200)) {
            let chunkAttempt = await tryPost({ user_ids: chunk, title, message });
            if (!chunkAttempt.ok) {
              for (const uid of chunk) {
                await tryPost({ user_id: uid, title, message });
              }
            }
          }
        }
      } else {
        let attempt = await tryPost({ user_ids: selectedUsers, title, message });
        if (!attempt.ok) {
          for (const uid of selectedUsers) {
            await tryPost({ user_id: uid, title, message });
          }
        }
      }

      const nombreDestinatario =
        broadcast
          ? "Todos los usuarios"
          : selectedUsers.length === 1
            ? usuarios.find((u) => u.id === selectedUsers[0])?.email ||
            usuarios.find((u) => u.id === selectedUsers[0])?.name ||
            "Usuario"
            : `${selectedUsers.length} usuarios`;

      const nuevaNotificacion = {
        id: Date.now(),
        titulo: title,
        mensaje: message,
        destinatario: nombreDestinatario,
        fecha: new Date().toLocaleString("es-ES"),
        estado: "Enviada",
      };

      setHistorial((prev) => [nuevaNotificacion, ...prev]);
      setExito("¡Notificación enviada exitosamente!");

      fetch("https://localhost:4000/api/v1/notifications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => { });

      setTitle("");
      setMessage("");
      setSelectedUsers([]);
      setBroadcast(false);
      setTimeout(() => setExito(""), 3000);
    } catch (err) {
      console.error("Error en envío:", err);
      setError("Error al enviar la notificación.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setEnviando(false);
    }
  };

  const selectedLabel = useMemo(() => {
    if (broadcast) return "Enviar Notificación (Todos)";
    const n = selectedUsers.length;
    if (n === 0) return "Enviar Notificación";
    if (n === 1) {
      const uid = selectedUsers[0];
      const u = usuarios.find((x) => x.id === uid);
      const display = u ? (u.email || u.nombre || u.name || `#${u.id}`) : `#${uid}`;
      return `Enviar a ${display}`;
    }
    return `Enviar Notificación — ${n} seleccionados`;
  }, [broadcast, selectedUsers, usuarios]);

  return (
    <Box className="ntf-root" sx={{ p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
      <Box className="ntf-content">
        {/* Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: { xs: 2, md: 3 }, textAlign: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1.5, md: 2 },
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <NotificationsIcon sx={{ fontSize: { xs: 32, sm: 40, md: 46 } }} />
              <Typography
                className="ntf-header-title"
                variant="h3"
                fontWeight="800"
                sx={{ fontSize: { xs: "1.7rem", sm: "2.1rem", md: "2.3rem", lg: "2.5rem" } }}
              >
                Panel de Notificaciones
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" } }}>
              Administra y envía notificaciones a tus usuarios de forma centralizada
            </Typography>
          </Box>
        </Fade>

        {/* Stats */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 }, justifyContent: "center" }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="ntf-stat ntf-stat--blue" elevation={0}>
              <Box className="ntf-stat-inner">
                <Avatar className="ntf-stat-avatar">
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total_usuarios}</Typography>
                  <Typography variant="body2">Usuarios Totales</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="ntf-stat ntf-stat--violet" elevation={0}>
              <Box className="ntf-stat-inner">
                <Avatar className="ntf-stat-avatar">
                  <SendIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total_notificaciones}</Typography>
                  <Typography variant="body2">Notificaciones Enviadas</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className="ntf-stat ntf-stat--gold" elevation={0}>
              <Box className="ntf-stat-inner">
                <Avatar className="ntf-stat-avatar">
                  <HistoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{historial.length}</Typography>
                  <Typography variant="body2">En esta sesión</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={{ xs: 3, md: 4 }} className="ntf-main-grid">
          <Grid item xs={12} lg={6}>
            <Card elevation={0} className="ntf-card">
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                  <Box sx={{ width: 5, height: 28, borderRadius: 2, mr: 2, bgcolor: "divider" }} />
                  <SendIcon sx={{ fontSize: 22, mr: 1 }} />
                  <Typography variant="h6" fontWeight="800">Enviar Nueva Notificación</Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Destinatario</InputLabel>
                      <Box className="ntf-topbar" sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                        <Button
                          variant={broadcast ? "contained" : "outlined"}
                          onClick={() => { setBroadcast((b) => !b); if (!broadcast) setSelectedUsers([]); }}
                          sx={{ textTransform: "none" }}
                        >
                          {broadcast ? "Enviar a todos (activo)" : "Enviar a todos (desactivado)"}
                        </Button>
                        <TextField
                          fullWidth
                          placeholder="Buscar usuario por nombre / email / id"
                          value={query}
                          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                          size="small"
                        />
                      </Box>

                      {!broadcast && (
                        <Paper variant="outlined" sx={{ maxHeight: 260, overflow: "auto" }}>
                          <TableContainer className="ntf-table">
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < pagedUsers.length}
                                      checked={pagedUsers.length > 0 && pagedUsers.every((u) => selectedUsers.includes(u.id))}
                                      onChange={(e) => handleSelectAllOnPage(e.target.checked)}
                                    />
                                  </TableCell>
                                  <TableCell>Nombre</TableCell>
                                  <TableCell>Email</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pagedUsers.map((u) => (
                                  <TableRow key={u.id} hover>
                                    <TableCell padding="checkbox">
                                      <Checkbox checked={isSelected(u.id)} onChange={() => handleToggle(u.id)} />
                                    </TableCell>
                                    <TableCell>{u.nombre || u.name || "—"}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <TablePagination
                            component="div"
                            count={filteredUsers.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 8, 20]}
                            labelRowsPerPage="Filas"
                          />
                        </Paper>
                      )}
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Título de la Notificación"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Ej: Actualización importante del sistema"
                    />

                    <Box className="ntf-message">
                      <TextField
                        name="mensaje"
                        fullWidth
                        variant="outlined"
                        multiline
                        minRows={12}
                        label="Mensaje"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder="Escribe aquí el contenido detallado de tu notificación…"
                        InputLabelProps={{ shrink: true }}
                        className="ntf-textarea"
                      />
                    </Box>

                    <Box>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        className="ntf-submit"
                        disabled={enviando || (!broadcast && selectedUsers.length === 0)}
                        startIcon={enviando ? null : <SendIcon />}
                        sx={{ py: 2, borderRadius: 2.5, textTransform: "none", fontSize: "1.02rem", fontWeight: 700 }}
                      >
                        {enviando ? (
                          <>
                            <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} />
                            Enviando...
                          </>
                        ) : (
                          selectedLabel
                        )}
                      </Button>

                      {error && (
                        <Fade in={!!error}>
                          <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                          </Alert>
                        </Fade>
                      )}
                      {exito && (
                        <Fade in={!!exito}>
                          <Alert severity="success" sx={{ mt: 2 }}>
                            {exito}
                          </Alert>
                        </Fade>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card elevation={0} className="ntf-card">
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                  <Box sx={{ width: 5, height: 28, background: "linear-gradient(180deg,#f093fb 0%,#f5af19 100%)", borderRadius: 2, mr: 2 }} />
                  <HistoryIcon sx={{ fontSize: 22, mr: 1 }} />
                  <Typography variant="h6" fontWeight="800">Historial de Notificaciones</Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {historial.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: { xs: 5, md: 8 } }}>
                    <MailOutlineIcon sx={{ fontSize: 54, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontSize: "1.02rem" }}>
                      No hay notificaciones enviadas
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "center" }}>
                      Las notificaciones enviadas aparecerán aquí
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2.5}>
                    {historial.map((notif) => (
                      <Fade in key={notif.id}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 26, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ wordBreak: "break-word" }}>
                                  {notif.titulo}
                                </Typography>
                                <Chip label={notif.estado} size="small" sx={{ fontWeight: 600 }} color="success" variant="outlined" />
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                {notif.mensaje}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <PeopleIcon sx={{ fontSize: 15 }} />
                                  <Typography variant="caption">{notif.destinatario}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <HistoryIcon sx={{ fontSize: 15 }} />
                                  <Typography variant="caption">{notif.fecha}</Typography>
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
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}