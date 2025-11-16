import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/stylesheets/UserPerfileHome.css"; // Asegúrate de tener este archivo CSS
import profilePic from "../../assets/images/user_default.png"; // Asegúrate de tener la imagen
import EditIcon from '@mui/icons-material/Edit';
import { FaStar } from "react-icons/fa";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Accordion from "./Accordion"; // Asegúrate de tener este componente
import { DataGrid } from "@mui/x-data-grid";
import { Box, Card, CardContent, Typography, Rating, Stack, FormControl, InputLabel, OutlinedInput } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useTheme } from "@mui/material/styles";
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

// *NOTA*: Las funciones 't' (de i18n) y 'fetchFavorites' no están definidas aquí,
// deberás adaptarlas o eliminarlas si no son necesarias para el perfil de administración.

function UserFullPerfil() {
    const { id } = useParams(); // ID del usuario a ver (viene de la URL)
    const { state } = useLocation(); // Datos del usuario si se pasaron por navegación
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    // 1. ESTADOS PRINCIPALES, inicializados con datos del state o nulos.
    const [user, setUser] = useState(state?.user || null);
    const [orders, setOrders] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [cart, setCart] = useState(null);

    // --- Modal para Enviar Notificación ---
    const [openNotifModal, setOpenNotifModal] = useState(false);
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [sendingNotif, setSendingNotif] = useState(false);
    const [notifError, setNotifError] = useState("");
    const [notifSuccess, setNotifSuccess] = useState("");


    const [openDrawer, setOpenDrawer] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
    });

    const handleOpenNotif = () => {
        setNotifTitle("");
        setNotifMessage("");
        setNotifError("");
        setNotifSuccess("");
        setOpenNotifModal(true);
    };

    const handleCloseNotif = () => {
        setOpenNotifModal(false);
    };

    const toggleDrawer = (open) => (event) => {
        if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setOpenDrawer(open);
    };

    const enviarNotificacionUsuario = async () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            setNotifError("El título y el mensaje son obligatorios.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setNotifError("No estás autenticado.");
            return;
        }

        setSendingNotif(true);
        setNotifError("");
        setNotifSuccess("");

        try {
            const res = await fetch("https://localhost:4000/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: id,   // ← EL USUARIO ACTUAL
                    title: notifTitle,
                    message: notifMessage,
                }),
            });

            if (!res.ok) throw new Error("Error en el servidor");

            setNotifSuccess("¡Notificación enviada!");
            setTimeout(() => {
                setOpenNotifModal(false);
            }, 1200);

        } catch (err) {
            setNotifError("No se pudo enviar la notificación.");
        } finally {
            setSendingNotif(false);
        }
    };


    useEffect(() => {
        if (!id) return;

        if (!user) {
            const token = localStorage.getItem("token");
            fetch(`https://localhost:4000/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("No se pudo cargar el usuario.");
                    return res.json();
                })
                .then((data) => {
                    setUser(data);
                    setFormData({
                        nombre: data.nombre || "",
                        apellido: data.apellido || "",
                        email: data.email || "",
                        telefono: data.telefono || "",
                        direccion: data.direccion || "",
                    });
                })
                .catch((err) => {
                    console.error("Error al cargar perfil:", err);
                    setError("Error al cargar el perfil del usuario.");
                    setLoading(false);
                });
        }
    }, [id, user]);

    useEffect(() => {
        if (!id) return;
        const token = localStorage.getItem("token");

        setLoading(true);

        fetch(`https://localhost:4000/api/v1/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
            if (!res.ok) throw new Error("No se pudo cargar el usuario.");
            return res.json();
            })
            .then((data) => {
            setUser(data);
            setOrders(data.orders || []);
            setUserReviews(data.reviews || []);
            setFavorites(data.favorites || []);
            setCart(data.cart || null);

            setReviewCount((data.reviews || []).length);
            setFormData({
                nombre: data.nombre || "",
                apellido: data.apellido || "",
                email: data.email || "",
                telefono: data.telefono || "",
                direccion: data.direccion || "",
            });
            })
            .catch((err) => {
            console.error("Error al cargar perfil:", err);
            setError("Error al cargar el perfil del usuario.");
            })
            .finally(() => setLoading(false));
        }, [id]);

    const handleLogout = () => {
        console.log("El administrador está cerrando sesión.");
        localStorage.removeItem('token');
        const lang = useParams().lang || 'es';
        window.location.href = `/${lang}/login`;
    };

    const rows = orders.map((order) => ({
        id: order.id,
        created_at: order.fecha_pago,
        estado: order.status || "Pendiente",
        numero_de_orden: order.numero_de_orden || "No especificado",
        total: order.pago_total || 0,
        cliente: order.clientes || user.nombre || "No especificado",
        email_cliente: order.email || user.email || "No especificado",
        pdf_url: order.pdf_url || "No especificado",
    }));

    const columns = [
        { field: "id", headerName: "ID Pedido", width: 120 },
        { field: "numero_de_orden", headerName: "N° de Orden", width: 150 },
        {
            field: "created_at",
            headerName: "Fecha",
            width: 150,
            valueGetter: (value, row) => new Date(row.created_at).toLocaleDateString(),
        },
        { field: "estado", headerName: "Estado", width: 120 },
        { field: "total", headerName: "Total ($)", width: 110, type: "number" },
        { field: "cliente", headerName: "Cliente", width: 160 },
        { field: "email_cliente", headerName: "Email Cliente", width: 200 },
        {
            field: "pdf_url",
            headerName: "Factura (PDF)",
            width: 150,
            sortable: false,
            renderCell: (params) => {
                const pdfUrl = params.value;
                if (!pdfUrl) return "—";
                return (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#D32F2F", display: "flex", alignItems: "center", textDecoration: "none" }}>
                        <PictureAsPdfIcon />
                    </a>
                );
            },
        },
    ];

    const faqItems = [
        {
            title: "Pedidos realizados",
            content: (
                <Box sx={{ height: 420, width: "100%" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        pageSizeOptions={[5, 10]}
                        disableRowSelectionOnClick
                        sx={{
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#0078FF",
                                color: "white",
                                fontWeight: "bold",
                            },
                            "& .MuiDataGrid-cell": { fontSize: "0.95rem" },
                        }}
                    />
                </Box>
            ),
        },
        {
            title: `Reviews escritas (${userReviews.length})`,
            content: (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {userReviews.length > 0 ? (
                        userReviews.map((review) => (
                            <div
                                key={review.id}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#fff",
                                    borderRadius: "10px",
                                    padding: "15px 20px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                            >
                                {/* Contenido de la review */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#555" }}>
                                            {user?.nombre?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <strong style={{ display: "flex", fontSize: "1rem", justifyContent: "start" }}>
                                                {user?.nombre || "Usuario"}
                                            </strong>
                                            <span style={{ fontSize: "0.8rem", color: "#777" }}>
                                                {new Date(review.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", color: "#e91e63" }}>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} size={18} color={i < review.rating ? "#e91e63" : "#ccc"} />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ marginTop: "10px", color: "#333", fontSize: "0.95rem" }}>
                                    {review.comentario}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>Este usuario no ha escrito reseñas aún.</p>
                    )}
                </div>
            ),
        },
        {
            title: "---",
            content: "Para cargar esta data, necesitas un endpoint de administrador que tome el ID del usuario.",
        },
    ];

    if (!user) {
        return <div className="profile-loading">Cargando perfil de usuario ID: {id}...</div>;
    }
    if (error) {
        return <div className="profile-error">{error}</div>;
    }

    const handleSaveUser = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`https://localhost:4000/api/v1/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                user: {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                telefono: formData.telefono
                }
            }),
            });

            const data = await res.json();

            if (!res.ok) {
            console.error("Error al actualizar usuario:", data);
            addAlert(data.errors?.join(", ") || "Error al actualizar usuario", "error");
            return;
            }

            // Actualiza el estado del usuario en pantalla
            setUser((prev) => ({ ...prev, ...data }));
            addAlert("Datos actualizados correctamente", "success");

        } catch (err) {
            console.error("Error inesperado:", err);
            addAlert("Error inesperado al actualizar", "error");
        }
        };


    return (
        <div className="profile-container">
            {/* Banner */}
            <div className="banner-perfil">
                <div className="banner-overlay"></div>
                <svg id="figure" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 800 800"><defs><linearGradient gradientTransform="rotate(45 0.5 0.5)" x1="50%" y1="0%" x2="50%" y2="100%" id="ppperspective-grad2"><stop stop-color="hsl(0, 0%, 100%)" stop-opacity="1" offset="0%"></stop><stop stop-color="hsl(0, 0%, 100%)" stop-opacity="0" offset="100%"></stop></linearGradient></defs><g fill="hsl(0, 0%, 100%)" shape-rendering="crispEdges"><polygon points="0,578 289,289 289,511 0,800" fill="url(#ppperspective-grad2)" opacity="0.45"></polygon><polygon points="0,800 289,511 511,511 222,800" fill="url(#ppperspective-grad2)" opacity="0.2"></polygon><rect width="222" height="222" x="289" y="289"></rect></g></svg>
            </div>

            {/* Perfil principal */}
            <div className="profile-content">
                <div style={{display:"flex", marginTop: 25, justifyContent:"space-between"}}>
                    <div display="flex" style={{display:"flex", zIndex: 100}}>
                        <div style={{ position: "relative" }}>
                            <img src={profilePic} alt="Profile" className="profile-img"/>
                        </div>
                        <div id="div-name-role" style={{display:"flex", flexDirection:"column", marginLeft:"20px", justifyContent:"end"}}>
                            <h1 className="profile-name">{user.nombre} {user.apellido}</h1>
                            <p className="profile-role">
                                {/* Puedes usar el rol del usuario aquí */}
                                Usuario ID: {user.id}
                            </p> 
                        </div>
                    </div>
                    
                    {/* Botón de Logout del ADMINISTRADOR */}
                    <div className="profile-actions">
                        <button style={{borderRadius: 10, backgroundColor: "#f5e9e9", height: 50}} id="notiButton" onClick={handleOpenNotif} ><NotificationAddIcon fontSize="medium" /></button>
                        <button id="logout-button-1" className="btn btn-primary" onClick={handleLogout}>Logout Admin <LogoutIcon fontSize="small"/></button>
                        <button id="logout-button-2" className="btn btn-primary" onClick={handleLogout}><LogoutIcon fontSize="small" /></button>
                    </div>
                </div>

                {/* Sección sobre mí */}
                <section className="about-section section-user-profile">
                    <section className="section-user-profile" style={{display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px"}}>
                        <div style={{width: "135%"}}>
                            <h2 className="h2-unic">Estadísticas del Usuario</h2>
                            <div className="exp-section" style={{ display: "flex", flexDirection: "row", gap: "15px"}}>
                                <div style={{display: "flex", flexDirection: "column", width: "100%", gap: "15px"}}>
                                    <div className="exp-card">
                                        <h3>compras realizadas</h3>
                                        <p>{orders.length}</p>
                                    </div>
                                    <div className="exp-card">
                                        <h3>reviews escritas</h3>
                                        <p>{reviewCount}</p>
                                    </div>
                                </div>
                                <div style={{display: "flex", flexDirection: "column", width: "100%", gap: "15px"}}>
                                    <div className="exp-card">
                                        <h3>Productos en favoritos</h3>
                                        <p>{favorites?.length ?? 0}</p>
                                    </div>
                                    <div className="exp-card">
                                        <h3>Productos en carrito</h3>
                                        <p>{cart?.cart_products?.length ?? 0}</p>
                                    </div> 
                                </div>
                                
                            </div>
                        </div>
                        
                        <div id="more-me">
                            <h2 className="h2-unic">Datos de contacto</h2>
                            <div className="about-details">
                                <div>
                                    <strong>Dirección:</strong> {user.direccion || "No proporcionada"}
                                </div>
                                <hr />
                                <div>
                                    <strong>Teléfono:</strong> {user.telefono || "No proporcionado"}
                                </div>
                                <hr />
                                <div>
                                    <strong>Email:</strong>{" "}
                                    <a href={`mailto:${user.email}`}>{user.email}</a>
                                </div>
                                <hr />

                                
                                <button className="edit-btn" onClick={toggleDrawer(true)}>
                                    Editar perfil
                                </button>

                                <SwipeableDrawer
                                    id="SwipeableDrawer"
                                    anchor="right"
                                    open={openDrawer}
                                    onClose={toggleDrawer(false)}
                                    onOpen={toggleDrawer(true)}
                                    PaperProps={{ sx: { color: "#333b4d", padding: "20px", background: "#ffffffff" } }}
                                >
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <h3 style={{ textAlign: "center", margin: 0 }}>Editar perfil de usuario</h3>

                                        <TextField label="Nombre" variant="outlined" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} fullWidth InputLabelProps={{ style: { color: "#8b949e" } }} InputProps={{ style: { color: "#a3a3a3" } }}/>
                                        <TextField label="Apellido" variant="outlined" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} fullWidth InputLabelProps={{ style: { color: "#8b949e" } }} InputProps={{ style: { color: "#a3a3a3" } }}/>
                                        <TextField label="Teléfono" variant="outlined" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} fullWidth InputLabelProps={{ style: { color: "#8b949e" } }} InputProps={{ style: { color: "#a3a3a3" } }}/>
                                        <TextField label="Email" type="email" variant="outlined" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth InputLabelProps={{ style: { color: "#8b949e" } }} InputProps={{ style: { color: "#a3a3a3" } }}/>
                                        
                                        <Button variant="contained" onClick={() => { handleSaveUser(); toggleDrawer(false); }} sx={{ mt: 2, backgroundColor: "#202020", "&:hover": { backgroundColor: "#ed3c76", borderColor: "#ed3c76" }, color: "#fff", borderRadius: "8px" }}>
                                            Guardar cambios
                                        </Button>
                                    </Box>
                                </SwipeableDrawer>
                            </div>

                        </div>
                        
                    </section>

                    
                </section>

                {/* información */}
                <section className="experience-section section-user-profile">
                    <h2>informacion administrativa</h2>
                    <div className="experience-grid">
                        <div className="exp-card">
                            <h3>Roles</h3>
                            <p>{user.roles?.join(", ") || "Regular User"}</p>
                            <span>Último acceso: N/A</span>
                        </div>
                        <div className="exp-card">
                            <h3>ID de usuario</h3>
                            <p> USER ID: {user.id || "Not provided"}</p>
                            <span>ID de la base de datos</span>
                        </div>
                        {user.roles?.includes("admin") ? (
                            <div id="role-user" className="exp-card" style={{background: "linear-gradient(90deg, #ededed 35%, #e3e3e3 50%, rgba(167, 255, 167, 1) 100%)"}}>
                                <div>
                                    <h3>Tipo de usuario</h3>
                                    <p>Admin</p>
                                    <span>Acceso total</span>
                                </div>
                                <div style={{width: "80px", height: "80px", backgroundColor: "#a7ffa7ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center"}}><h1>A</h1></div>
                            </div>
                        ) : (
                            <div id="role-user" className="exp-card" style={{background: "linear-gradient(90deg, #ededed 35%, #e3e3e3 50%, #eb5e8c 100%)"}}>
                                <div>
                                    <h3>Tipo de usuario</h3>
                                    <p>Regular User</p>
                                    <span>Acceso limitado</span>
                                </div>
                                <div style={{width: "80px", height: "80px", backgroundColor: "#eb5e8c", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center"}}><h1 style={{color: "#fff"}}>R</h1></div>
                            </div>
                        )}
                    </div>
                </section>

                <Accordion items={faqItems} />

                {openNotifModal && (
                    <Box
                        sx={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.4)", 
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                        }}
                    >
                        {/* Contenedor del Modal */}
                        <Box
                            sx={{
                                width: "90%",
                                maxWidth: 480,
                                bgcolor: "#fff",
                                p: 3,
                                borderRadius: 4,
                                boxShadow: 24,
                                backgroundColor: "#fcfcfc", 
                            }}
                        >
                            {/* Título del Modal */}
                            <Typography variant="h6" fontWeight={500} textAlign="center" mb={3}>
                                Enviar notificación a {user.nombre} {user.apellido}
                            </Typography>
                            
                            <TextField
                                fullWidth
                                label="Título"
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <FormControl fullWidth>
                                <InputLabel htmlFor="mensaje-notificacion">Mensaje</InputLabel>
                                <OutlinedInput
                                    id="mensaje-notificacion"
                                    multiline
                                    sx={{
                                        minHeight: 250,
                                        '& .MuiInputBase-inputMultiline': {
                                            minHeight: 250,
                                        },
                                    }}
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    label="Mensaje"
                                />
                            </FormControl>

                            {notifError && (
                                <Typography color="error" mt={2}>{notifError}</Typography>
                            )}

                            {notifSuccess && (
                                <Typography color="green" mt={2}>{notifSuccess}</Typography>
                            )}

                            <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
                                <Button 
                                    variant="outlined" 
                                    onClick={handleCloseNotif}
                                    sx={{
                                        borderColor: '#e0e0e0',
                                        color: '#444',
                                    }}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={enviarNotificacionUsuario}
                                    disabled={sendingNotif}
                                    sx={{
                                        backgroundColor: '#212121',
                                        '&:hover': {
                                            backgroundColor: '#424242',
                                        },
                                        color: 'white',
                                    }}
                                >
                                    {sendingNotif ? "Enviando..." : "Enviar"}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                )}

            </div>
        </div>
    );
}

export default UserFullPerfil;