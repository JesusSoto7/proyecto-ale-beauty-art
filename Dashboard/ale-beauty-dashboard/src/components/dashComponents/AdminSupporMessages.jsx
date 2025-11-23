import React, { useEffect, useState } from "react";

export default function AdminSupportMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No hay token. El usuario no está autenticado.");
      return;
    }

    try {
        const res = await fetch("https://localhost:4000/api/v1/support_messages", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
        });


      if (!res.ok) {
        throw new Error("Error al obtener mensajes");
      }

      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p>Cargando mensajes...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mensajes de soporte</h1>

      {messages.length === 0 ? (
        <p>No hay mensajes aún.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} style={{
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            <h3>{msg.name} {msg.last_name}</h3>
            <p><strong>Email:</strong> {msg.email}</p>
            <p><strong>Asunto:</strong> {msg.subject}</p>
            <p><strong>Mensaje:</strong> {msg.message_text}</p>
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
