import { useEffect, useState } from "react";
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("https://localhost:4000/api/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar perfil");
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
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");

    fetch("https://localhost:4000/api/v1/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar perfil");
        return res.json();
      })
      .then((updatedUser) => {
        setUser(updatedUser);
        setEditMode(false);
      })
      .catch((err) => console.error(err));
  };

  if (!user) {
    return <p className="text-center mt-5">Cargando perfil...</p>;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg border-0 rounded-3 p-4"
        style={{ maxWidth: "700px", width: "100%" }}
      >
        <div className="row g-4">
          {/* Columna izquierda - Imagen */}
          <div className="col-md-4 text-center">
            <div className="position-relative d-inline-block">
              <img
                src={user_icon}
                alt="Foto de perfil"
                className="rounded img-fluid"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="col-md-8">
            {!editMode ? (
              <>
                <p>
                  <strong>Name:</strong> {user.nombre} {user.apellido}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone Number:</strong>{" "}
                  {user.telefono || "No registrado"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {user.direccion || "No registrada"}
                </p>

                <div className="mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile
                  </button>
                  <button
                    className="btn btn-danger ms-2"
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mt-4">
                  <button className="btn btn-success me-2" onClick={handleSave}>
                    Guardar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancelar
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
