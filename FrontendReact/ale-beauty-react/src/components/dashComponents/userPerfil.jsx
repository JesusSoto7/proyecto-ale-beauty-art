import React from "react";
import "../../assets/stylesheets/UserPerfileHome.css";
import { useEffect, useState } from "react";
import profilePic from "../../assets/images/user_default.png";
import EditIcon from '@mui/icons-material/Edit';
const sample1 = "https://i.pinimg.com/736x/11/3b/bb/113bbbd36915506258c7bb13ee0754f0.jpg";
const sample2 = "https://i.pinimg.com/736x/37/8e/a6/378ea60eee35ee300bab91576e8acf73.jpg";
const sample3 = "https://i.pinimg.com/736x/ed/c9/85/edc985cfe1938991bdf4e7957be0dd3b.jpg";


function UserProfile() {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
    });

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

    if (!user) {
        return <div className="profile-loading">Loading profile...</div>;
    }



  return (
    <div className="profile-container">
      {/* Banner */}
      <div className="banner-perfil">
        <div className="banner-overlay"></div>
      </div>

      {/* Perfil principal */}
      <div className="profile-content">
        <div style={{display:"flex", marginTop: 25, justifyContent:"space-between"}}>
            <div display="flex" style={{display:"flex"}}>
                <div style={{ position: "relative" }}>
                    <img
                    src={profilePic}
                    alt="Profile"
                    className="profile-img"/>

                    {/* Mostrar circulito con "A" si el usuario es admin */}
                    {user.roles?.includes("admin") && (
                    <div
                        style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "20px",
                        height: "20px",
                        background: "linear-gradient(135deg, #1E90FF, #0078FF)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "2px solid white",
                        boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        A
                    </div>
                    )}
                </div>
                <div style={{display:"flex", flexDirection:"column", marginLeft:"20px", justifyContent:"end"}}>
                    <h1 className="profile-name">{user.nombre} {user.apellido}</h1>
                    <p className="profile-role">
                    I'm a Product Designer based in Melbourne.
                    </p> 
                </div>
            </div>
            

            <div className="profile-actions">
                <button className="btn btn-secondary"><EditIcon /></button>
                <button className="btn btn-primary">Logout</button>
            </div>
        </div>

        {/* Sección sobre mí */}
        <section className="about-section">
          <h2>About me</h2>
          <p>
            I'm a Product Designer based in Melbourne, Australia. I enjoy working on
            product design and Webflow projects. I occasionally take on freelance work.
          </p>

          <div className="about-details">
            <div>
              <strong>Dirección:</strong> {user.direccion || "Not provided"}
            </div>
            <div>
              <strong>Telefono:</strong> {user.telefono || "Not provided"}
            </div>
            <div>
              <strong>Email:</strong> <a href={`mailto:${user.email}`}>{user.email}</a>
            </div>
          </div>
        </section>

        {/* Experiencia */}
        <section className="experience-section">
          <h2>informacion</h2>
          <div className="experience-grid">
            <div className="exp-card">
              <h3>Lead Product Designer</h3>
              <p>CollabTech</p>
              <span>May 2020 - Present</span>
            </div>
            <div className="exp-card">
              <h3>Fecha de creación</h3>
              <p> USER ID: {user.id || "Not provided"}</p>
              <span>Mar 2017 - Jan 2018</span>
            </div>
            {user.roles?.includes("admin") ? (
                <div id="role-user" className="exp-card">
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

        {/* Trabajos recientes */}
        <section className="recent-section">
          <h2>Recent work</h2>
          <div className="recent-grid">
            <img src={sample1} alt="Work 1" />
            <img src={sample2} alt="Work 2" />
            <img src={sample3} alt="Work 3" />
          </div>
        </section>
        {/* compras realizadas */}
        {/* comentarios */}
      </div>
    </div>
  );
}

export default UserProfile;
