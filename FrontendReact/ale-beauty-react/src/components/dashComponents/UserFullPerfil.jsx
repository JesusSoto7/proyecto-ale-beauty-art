import React from "react";
import "../../assets/stylesheets/UserPerfileHome.css";
import { useEffect, useState } from "react";
import profilePic from "../../assets/images/user_default.png";
import EditIcon from '@mui/icons-material/Edit';
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Accordion from "./Accordion";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Card, CardContent, Typography, Rating, Stack } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const sample1 = "https://i.pinimg.com/736x/11/3b/bb/113bbbd36915506258c7bb13ee0754f0.jpg";
const sample2 = "https://i.pinimg.com/736x/37/8e/a6/378ea60eee35ee300bab91576e8acf73.jpg";
const sample3 = "https://i.pinimg.com/736x/ed/c9/85/edc985cfe1938991bdf4e7957be0dd3b.jpg";



function UserFullProfile() {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [orders, setOrders] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [cart, setCart] = useState(null);
    const [error, setError] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [userReviews, setUserReviews] = useState([]);
    const { lang } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const [openDrawer, setOpenDrawer] = useState(false);

    const toggleDrawer = (open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
        return;
    }
    setOpenDrawer(open);
    };


    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
    });

    const rows = orders.map((order) => ({
        id: order.id,
        created_at: order.fecha_pago,
        estado: order.status || "Pendiente",
        numero_de_orden: order.numero_de_orden || "No especificado",
        total: order.pago_total || 0,
        cliente: order.clientes || "No especificado",
        email_cliente: order.email || "No especificado",
        pdf_url: order.pdf_url || "No especificado",
    }));

    const columns = [
        { field: "id", headerName: "ID Pedido", width: 120 },
        {
        field: "numero_de_orden",
        headerName: "N° de Orden",
        width: 150,
        },
        {
        field: "created_at",
        headerName: "Fecha",
        width: 150,
        valueGetter: (value, row) =>
            new Date(row.created_at).toLocaleDateString(),
        },
        {
        field: "estado",
        headerName: "Estado",
        width: 120,
        },
        {
        field: "total",
        headerName: "Total ($)",
        width: 110,
        type: "number",
        },
        {
        field: "cliente",
        headerName: "Cliente",
        width: 160,
        },
        {
        field: "email_cliente",
        headerName: "Email Cliente",
        width: 200,
        },
        {
            field: "pdf_url",
            headerName: "Factura (PDF)",
            width: 150,
            sortable: false,
            renderCell: (params) => {
            const pdfUrl = params.value;
            if (!pdfUrl) return "—";

            return (
                <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    color: "#D32F2F",
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                }}
                >
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
                initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10]}
                disableRowSelectionOnClick
                sx={{
                "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#0078FF",
                    color: "white",
                    fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                    fontSize: "0.95rem",
                },
                }}
            />
            </Box>
        ),
        },
        {
        title: "Reviews escritas",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {userReviews.length > 0 ? (
                userReviews.map((review) => (
                <div
                    key={review.id}
                    style={{
                    borderRadius: "8px",
                    padding: "10px 15px",
                    background: "#161b22",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    }}
                >
                    <h4>{review.product.nombre_producto}</h4>
                    <p style={{ margin: "5px 0" }}>{review.comentario}</p>
                    <p style={{ fontSize: "0.9rem", color: "#777" }}>
                    ⭐ {review.rating} —{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                    </p>
                </div>
                ))
            ) : (
                <p>No has escrito reseñas aún.</p>
            )}
            </div>
        ),
        },

        {
        title: "- - -",
        content: "Pestaña libre para futuros usos.",
        },
    ];

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
        setToken(savedToken);
        } else {
        alert(t('orders.notAuthenticated'));
        setLoading(false);
        }
    }, []);

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://localhost:4000/api/v1/my_reviews", {
        headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => res.json())
        .then((data) => {
        setReviewCount(data.total);     // número total
        setUserReviews(data.reviews);   // lista completa
        })
        .catch((err) => console.error("Error al obtener reseñas:", err));
    }, []);

    const fetchCart = () => {
        setLoading(true);
        setError(null);
        fetch("https://localhost:4000/api/v1/cart", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch cart");
            return res.json();
        })
        .then((data) => setCart(data))
        .catch((err) => {
            console.error("Error cargando cart: ", err);
            setError(t("cart.loadingError"));
        })
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!token) return;
        fetch("https://localhost:4000/api/v1/my_orders", {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch((err) => console.error(t('orders.loadError'), err))
        .finally(() => setLoading(false));
        fetchFavorites();
        fetchCart();
    }, [token]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("https://localhost:4000/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.ok) throw new Error(t("profile.loadError"));
            return res.json();
        })
        .then((data) => {
            setUser(data);
            setFormData({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            email: data.email || "",
            telefono: data.telefono || "",
            });
        })
        .catch((err) => console.error(err));
    }, []);

    const handleSave = () => {
        const token = localStorage.getItem("token");

        fetch("https://localhost:4000/api/v1/me", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
        })
        .then((res) => {
            if (!res.ok) throw new Error(t("profile.updateError"));
            return res.json();
        })
        .then((updatedUser) => {
            setUser(updatedUser);
            setEditMode(false);
        })
        .catch((err) => console.error(err));
    };

    if (!user) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    

    async function fetchFavorites() {
        setLoading(true);
        try {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            setFavorites(data.map(p => ({ ...p, isRemoving: false })));
        }
        } catch (err) {
        console.error(t('favorites.loadError'), err);
        } finally {
        setLoading(false);
        }
    }

    async function handleLogout() {
        const token = localStorage.getItem('token');
        try {
        await fetch('https://localhost:4000/api/v1/sign_out', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        } catch (err) {
        console.warn('Error cerrando sesión:', err);
        }
        localStorage.removeItem('token');
        window.location.href = `/${lang || 'es'}/login`; // ✅ Redirección con idioma por defecto
    }

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
                    <img
                    src={profilePic}
                    alt="Profile"
                    className="profile-img"/>
                </div>
                <div id="div-name-role" style={{display:"flex", flexDirection:"column", marginLeft:"20px", justifyContent:"end"}}>
                    <h1 className="profile-name">{user.nombre} {user.apellido}</h1>
                    <p className="profile-role">
                    I'm a Product Designer based in Melbourne.
                    </p> 
                </div>
            </div>
            

            <div className="profile-actions">
                <button id="logout-button-1" className="btn btn-primary" onClick={handleLogout}>Logout <LogoutIcon fontSize="small"/></button>
                <button id="logout-button-2" className="btn btn-primary" onClick={handleLogout}><LogoutIcon fontSize="small" /></button>
            </div>
        </div>

        {/* Sección sobre mí */}
        <section className="about-section section-user-profile">
          <section className="section-user-profile" style={{display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px"}}>
            <div style={{width: "135%"}}>
                <h2 className="h2-unic">About me</h2>
                <div className="exp-section" style={{ display: "flex", flexDirection: "row", gap: "15px"}}>
                    <div style={{display: "flex", flexDirection: "column", width: "100%", gap: "15px"}}>
                        <div className="exp-card" style={{}}>
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
                            <p>{favorites.length}</p>
                        </div>
                        <div className="exp-card">
                            <h3>Productos en carrito</h3>
                            <p>
                                {cart && cart.products
                                    ? cart.products.reduce((total, item) => total + item.cantidad, 0)
                                    : 0
                                }
                            </p>
                        </div>    
                    </div>
                    
                </div>


            </div>
            
            <div id="more-me">
                <h2 className="h2-unic">More About me</h2>
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

                    {/* 🟢 Botón que abre el Drawer */}
                    <button className="edit-btn" onClick={toggleDrawer(true)}>
                        Editar perfil
                    </button>

                    {/* 🟣 Drawer deslizante */}
                    <SwipeableDrawer
                        id="SwipeableDrawer"
                        anchor="right"
                        open={openDrawer}
                        onClose={toggleDrawer(false)}
                        onOpen={toggleDrawer(true)}
                        PaperProps={{
                        sx: {
                            // backgroundColor: "#161b22",
                            color: "#c9d1d9",
                            padding: "20px",
                            background: "#161b22"
                        },
                        }}
                    >
                        <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                        >
                        <h3 style={{ textAlign: "center", margin: 0 }}>Editar perfil</h3>

                        <TextField
                            label="Nombre"
                            variant="outlined"
                            value={formData.nombre}
                            onChange={(e) =>
                            setFormData({ ...formData, nombre: e.target.value })
                            }
                            fullWidth
                            InputLabelProps={{ style: { color: "#8b949e" } }}
                            InputProps={{ style: { color: "#c9d1d9" } }}
                        />

                        <TextField
                            label="Apellido"
                            variant="outlined"
                            value={formData.apellido}
                            onChange={(e) =>
                            setFormData({ ...formData, apellido: e.target.value })
                            }
                            fullWidth
                            InputLabelProps={{ style: { color: "#8b949e" } }}
                            InputProps={{ style: { color: "#c9d1d9" } }}
                        />

                        <TextField
                            label="Teléfono"
                            variant="outlined"
                            value={formData.telefono}
                            onChange={(e) =>
                            setFormData({ ...formData, telefono: e.target.value })
                            }
                            fullWidth
                            InputLabelProps={{ style: { color: "#8b949e" } }}
                            InputProps={{ style: { color: "#c9d1d9" } }}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={formData.email}
                            onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                            }
                            fullWidth
                            InputLabelProps={{ style: { color: "#8b949e" } }}
                            InputProps={{ style: { color: "#c9d1d9" } }}
                        />

                        <Button
                            variant="contained"
                            onClick={() => {
                            handleSave(formData);
                            setOpenDrawer(false);
                            }}
                            sx={{
                            mt: 2,
                            backgroundColor: "#238636",
                            "&:hover": { backgroundColor: "#2ea043" },
                            color: "#fff",
                            borderRadius: "8px",
                            }}
                        >
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
          <h2>informacion</h2>
          <div className="experience-grid">
            <div className="exp-card">
              <h3>ultima vez conectado</h3>
              <p>ahora mismo</p>
              <span>May 2020 - Present</span>
            </div>
            <div className="exp-card">
              <h3>ID de usuario</h3>
              <p> USER ID: {user.id || "Not provided"}</p>
              <span>Mar 2017 - Jan 2018</span>
            </div>
            {user.roles?.includes("admin") ? (
                <div id="role-user" className="exp-card" style={{background: "linear-gradient(90deg,rgba(36, 42, 50, 1) 35%, rgba(56, 75, 68, 1) 50%, rgba(167, 255, 167, 1) 100%)"}}>
                    <div>
                        <h3>Tipo de usuario</h3>
                        <p>Admin</p>
                        <span>Jan 2016 - May 2020</span>  
                    </div>

                    <div style={{width: "80px", height: "80px", backgroundColor: "#a7ffa7ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center"}}><h1>A</h1></div>
                </div>
            ) : (
                <div className="exp-card">
                    <h3>Tipo de usuario</h3>
                    <p>Regular User</p>
                    <span>Jan 2016 - May 2020</span>
                </div>
            )}


          </div>
        </section>

        {/* Trabajos recientes
        <section className="recent-section section-user-profile">
          <h2>Recent work</h2>
          <div className="recent-grid">
            <img src={sample1} alt="Work 1" />
            <img src={sample2} alt="Work 2" />
            <img src={sample3} alt="Work 3" />
          </div>
        </section> */}

        <Accordion items={faqItems} />
        {/* compras realizadas */}
        {/* comentarios */}
      </div>
    </div>
  );
}

export default UserFullProfile;
