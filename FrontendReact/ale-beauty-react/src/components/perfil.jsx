import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import user_icon from "../assets/images/user_default.png";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  const { t } = useTranslation();

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
  }, [t]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        gap: "16px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #ff4d94",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <h4 style={{ 
          color: '#ff4d94',
          fontWeight: 'bold',
          margin: 0
        }}>
          {t("profile.loading")}
        </h4>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div
        className="shadow-lg rounded-4 p-4"
        style={{ maxWidth: "800px", width: "100%", backgroundColor: "#fff" }}
      >
        <div className="row align-items-center g-4">
          {/* Columna izquierda - Avatar */}
          <div className="col-md-4 text-center">
            <img
              src={user_icon}
              alt={t("profile.avatarAlt")}
              className="rounded-3 img-fluid"
              style={{
                width: "220px",
                height: "220px",
                objectFit: "cover",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              }}
            />
          </div>

          {/* Columna derecha */}
          <div className="col-md-8">
            {!editMode ? (
              <>
                <p>
                  <strong>{t("profile.name")}:</strong> {user.nombre}
                </p>
                <p>
                  <strong>{t("profile.lastname")}:</strong> {user.apellido}
                </p>
                <p>
                  <strong>{t("profile.phone")}:</strong>{" "}
                  {user.telefono || t("profile.notRegistered")}
                </p>
                <p>
                  <strong>{t("profile.email")}:</strong> {user.email}
                </p>

                <div className="mt-4">
                  <button
                    className="btn border-0 text-white px-4 py-2"
                    style={{
                      background: "linear-gradient(90deg, #ff6a88, #ffcc70)",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                    onClick={() => setEditMode(true)}
                  >
                    {t("profile.edit")}
                  </button>
                  <button
                    className="btn btn-outline-danger ms-2 px-4 py-2"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                  >
                    {t("profile.logout")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2">
                  <label className="form-label">{t("profile.name")}</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">{t("profile.lastname")}</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">{t("profile.email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">{t("profile.phone")}</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mt-4">
                  <button
                    className="btn border-0 text-white px-4 py-2 me-2"
                    style={{
                      background: "linear-gradient(90deg, #38ef7d, #11998e)",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                    onClick={handleSave}
                  >
                    {t("profile.save")}
                  </button>
                  <button
                    className="btn btn-secondary px-4 py-2"
                    onClick={() => setEditMode(false)}
                  >
                    {t("profile.cancel")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}