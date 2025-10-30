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
  const [selectedUsers, setSelectedUsers] = useState([]); // array of ids
  const [broadcast, setBroadcast] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

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
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
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

  // Helpers: chunk array
  const chunkArray = (arr, size) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
    return res;
  };

  // Filtering & pagination for users table
  const filteredUsers = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      (u.email || "").toLowerCase().includes(q) ||
      (u.nombre || u.name || "").toLowerCase().includes(q) ||
      String(u.id) === q
    );
  }, [usuarios, query]);

  const pagedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const isSelected = (id) => selectedUsers.indexOf(id) !== -1;

  const handleToggle = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = (checked) => {
    const idsOnPage = pagedUsers.map((u) => u.id);
    setSelectedUsers((prev) => {
      if (checked) {
        // add those not present
        const union = Array.from(new Set([...prev, ...idsOnPage]));
        return union;
      } else {
        // remove those in page
        return prev.filter((id) => !idsOnPage.includes(id));
      }
    });
  };

  const handleChangePage = (e, newPage) => setPage(newPage);
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
    return { ok: res.ok, status: res.status, json: res.ok ? await res.json().catch(()=>null) : null };
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
      setError("Selecciona al menos un destinatario o active 'Enviar a todos'.");
      setTimeout(() => setError(""), 3000);
      setEnviando(false);
      return;
    }

    try {
      if (broadcast) {

        let attempt = await tryPost({ broadcast: true, title, message });
        if (!attempt.ok) {
          // 2) try { user_id: "all" }
          attempt = await tryPost({ user_id: "all", title, message });
        }
        if (!attempt.ok) {
          // 3) try sending all ids as user_ids array (if backend supports)
          const allIds = usuarios.map((u) => u.id);
          if (allIds.length === 0) {
            throw new Error("No hay usuarios para enviar (lista vacía).");
          }
          attempt = await tryPost({ user_ids: allIds, title, message });
        }
        if (!attempt.ok) {

          const allIds = usuarios.map((u) => u.id);
          const chunks = chunkArray(allIds, 200);
          for (const chunk of chunks) {
            // try batch first
            let chunkAttempt = await tryPost({ user_ids: chunk, title, message });
            if (!chunkAttempt.ok) {
              // fallback to single requests
              for (const uid of chunk) {
                await tryPost({ user_id: uid, title, message });
              }
            }
          }
        }
      } else {
 
        let attempt = await tryPost({ user_ids: selectedUsers, title, message });
        if (!attempt.ok) {
          // fallback: try single per user
          for (const uid of selectedUsers) {
            const single = await tryPost({ user_id: uid, title, message });
          }
        }
      }

  
      let nombreDestinatario = broadcast
        ? "Todos los usuarios"
        : selectedUsers.length === 1
        ? (usuarios.find((u) => u.id === selectedUsers[0])?.email || usuarios.find((u) => u.id === selectedUsers[0])?.name || "Usuario")
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

      // refresh stats (best-effort)
      fetch("https://localhost:4000/api/v1/notifications/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(() => {});

      // reset form
      setTitle("");
      setMessage("");
      setSelectedUsers([]);
      setBroadcast(false);

      setTimeout(() => setExito(""), 3000);
    } catch (err) {
      console.error("Error en envío:", err);
      setError("Error al enviar la notificación. Revisa la consola para más detalles.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setEnviando(false);
    }
  };

  // New: compute a friendly button label (singular/plural/name) — fixes the unwanted leading hyphen
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
    <>
      <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; }
          body { scrollbar-width: none; }
          body::-webkit-scrollbar { display: none; }
        `}</style>

      <Box sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "linear-gradient(135deg, #b3bad6ff 0%, #d16fa073 100%)", backgroundAttachment: "fixed", p: 0, m: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, p: 4, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <Box sx={{ maxWidth: "1400px", margin: "0 auto", width: "100%", flexShrink: 0 }}>
            {/* Header */}
            <Fade in timeout={800}>
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
                  <NotificationsIcon sx={{ fontSize: 45, color: "#fff" }} />
                  <Typography variant="h3" fontWeight="800" sx={{ color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
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
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(102,126,234,0.7) 100%)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.4)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)", width: 60, height: 60 }}>
                        <PeopleIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">{stats.total_usuarios}</Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>Usuarios Totales</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1200}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, rgba(240,147,251,0.9) 0%, rgba(240,147,251,0.7) 100%)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.4)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)", width: 60, height: 60 }}>
                        <SendIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">{stats.total_notificaciones}</Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>Notificaciones Enviadas</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fade in timeout={1600}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, background: "linear-gradient(135deg, rgba(255,193,7,0.9) 0%, rgba(255,193,7,0.7) 100%)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.4)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)", width: 60, height: 60 }}>
                        <HistoryIcon sx={{ color: "#fff", fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color="#fff">{historial.length}</Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>En esta sesión</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={4} sx={{ justifyContent: "center" }}>
              {/* Form Card */}
              <Grid item xs={12} lg={5.5}>
                <Fade in timeout={1800}>
                  <Card elevation={0} sx={{ borderRadius: 3, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.5)" }}>
                    <CardContent sx={{ p: 5, overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Box sx={{ width: 5, height: 35, background: "linear-gradient(180deg,#667eea 0%,#764ba2 100%)", borderRadius: 2, mr: 2 }} />
                        <SendIcon sx={{ color: "#667eea", fontSize: 28, mr: 1 }} />
                        <Typography variant="h5" fontWeight="800" color="#333">Enviar Nueva Notificación</Typography>
                      </Box>

                      <Divider sx={{ mb: 4, background: "rgba(0,0,0,0.05)" }} />

                      <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3.5}>
                          {/* Destinatario area */}
                          <FormControl fullWidth>
                            <InputLabel>Destinatario</InputLabel>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                              <Button variant={broadcast ? "contained" : "outlined"} color="primary" onClick={() => { setBroadcast((b) => !b); if (!broadcast) setSelectedUsers([]); }} sx={{ textTransform: "none" }}>
                                {broadcast ? "Enviar a todos (activo)" : "Enviar a todos (desactivado)"}
                              </Button>
                              <TextField placeholder="Buscar usuario por nombre / email / id" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} size="small" sx={{ ml: "auto", bgcolor: "#f8f9fa", borderRadius: 1 }} />
                            </Box>

                            {!broadcast && (
                              <Paper variant="outlined" sx={{ maxHeight: 260, overflow: "auto" }}>
                                <TableContainer>
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

                                <TablePagination component="div" count={filteredUsers.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 8, 20]} labelRowsPerPage="Filas" />
                              </Paper>
                            )}
                          </FormControl>

                          {/* Title */}
                          <TextField fullWidth label="Título de la Notificación" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Actualización importante del sistema" InputProps={{ startAdornment: <TitleOutlinedIcon sx={{ mr: 1, color: "#667eea" }} /> }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#f8f9fa", border: "2px solid transparent", height: "56px" } }} />

                          {/* Message */}
                          <Box>
                            <TextField fullWidth multiline rows={12} label="Mensaje" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Escribe aquí el contenido detallado de tu notificación..." InputLabelProps={{ shrink: true }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#f8f9fa", border: "2px solid transparent", minHeight: "280px" }, "& .MuiInputBase-inputMultiline": { padding: "16px 14px" } }} />
                          </Box>

                          {/* Send button */}
                          <Box>
                            <Button type="submit" variant="contained" fullWidth size="large" disabled={enviando || (!broadcast && selectedUsers.length === 0)} startIcon={enviando ? null : <SendIcon />} sx={{ py: 2, borderRadius: 2.5, textTransform: "none", fontSize: "1.1rem", fontWeight: 700, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                              {enviando ? (<><CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />Enviando...</>) : selectedLabel}
                            </Button>

                            {error && (<Fade in={!!error}><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Fade>)}
                            {exito && (<Fade in={!!exito}><Alert severity="success" sx={{ mt: 2 }}>{exito}</Alert></Fade>)}
                          </Box>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Historial Card (unchanged) */}
              <Grid item xs={12} lg={5.5}>
                <Fade in timeout={2000}>
                  <Card elevation={0} sx={{ borderRadius: 3, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.5)" }}>
                    <CardContent sx={{ p: 5, overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <Box sx={{ width: 5, height: 35, background: "linear-gradient(180deg,#f093fb 0%,#f5af19 100%)", borderRadius: 2, mr: 2 }} />
                        <HistoryIcon sx={{ color: "#f093fb", fontSize: 28, mr: 1 }} />
                        <Typography variant="h5" fontWeight="800" color="#333">Historial de Notificaciones</Typography>
                      </Box>

                      <Divider sx={{ mb: 3, background: "rgba(0,0,0,0.05)" }} />

                      {historial.length === 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, color: "#999" }}>
                          <MailOutlineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ mb: 1, fontSize: "1.2rem" }}>No hay notificaciones enviadas</Typography>
                          <Typography variant="body2">Las notificaciones enviadas aparecerán aquí</Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2.5} sx={{ maxHeight: "calc(100vh - 550px)", overflowY: "auto", pr: 2 }}>
                          {historial.map((notif) => (
                            <Fade in key={notif.id}>
                              <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, background: "linear-gradient(135deg,#f5f7fa 0%,#fff 100%)", border: "2px solid #e8ecf1" }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
                                  <CheckCircleOutlineIcon sx={{ color: "#4CAF50", fontSize: 32, mt: 0.5 }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                      <Typography variant="h6" fontWeight="700" color="#333" sx={{ wordBreak: "break-word" }}>{notif.titulo}</Typography>
                                      <Chip label={notif.estado} size="small" sx={{ background: "linear-gradient(135deg,#4CAF50 0%,#45a049 100%)", color: "#fff", fontWeight: 600 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: "#666", mb: 1.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{notif.mensaje}</Typography>
                                    <Box sx={{ display: "flex", gap: 3 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <PeopleIcon sx={{ fontSize: 16, color: "#999" }} />
                                        <Typography variant="caption" sx={{ color: "#999", fontSize: "0.85rem" }}>{notif.destinatario}</Typography>
                                      </Box>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <HistoryIcon sx={{ fontSize: 16, color: "#999" }} />
                                        <Typography variant="caption" sx={{ color: "#999", fontSize: "0.85rem" }}>{notif.fecha}</Typography>
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