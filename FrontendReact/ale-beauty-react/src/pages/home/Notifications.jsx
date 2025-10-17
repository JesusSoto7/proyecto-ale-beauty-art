import React, { useState, useEffect } from "react";

export default function Notificaciones() {
  const [token, setToken] = React.useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [destinatario, setDestinatario] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Cargar usuarios al montar el componente

    React.useEffect(() => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      } else {
        alert("no esta atenticado");
      }
    }, []);
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/users", {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
    })
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => setUsuarios([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(""); setExito("");
    try {
      const res = await fetch("https://localhost:4000/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: destinatario,
          title: title,
          message: message
        })
      });
      if (!res.ok) throw new Error();
      setExito("¡Notificación enviada!");
      setTitle(""); setMessage(""); setDestinatario("");
    } catch (err) {
      setError("Error al enviar la notificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1>Enviar Notificación</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label>Destinatario:</label><br />
            <select value={destinatario} onChange={e => setDestinatario(e.target.value)} required>
            <option value="">Selecciona un usuario</option>
            <option value="all">Todos los usuarios</option>
            {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.email || u.name}</option>
            ))}
            </select>
        </div>
        <div>
          <label>Título:</label><br />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Mensaje:</label><br />
          <textarea value={message} onChange={e => setMessage(e.target.value)} required />
        </div>
        <button type="submit" disabled={enviando}>Enviar</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {exito && <p style={{ color: "green" }}>{exito}</p>}
      </form>
    </div>
  );
}