import React, { useEffect, useState } from "react";
import "../../assets/stylesheets/AdminSupportMessages.css";

export default function AdminSupportMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState('all');
  // Almacena el objeto completo del mensaje seleccionado, no solo el ID
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async (status = 'all') => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No hay token. El usuario no está autenticado.");
      setLoading(false);
      return;
    }

    try {
      const url = `https://localhost:4000/api/v1/support_messages?status=${status}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al obtener mensajes");
      }

      const data = await res.json();
      setMessages(data);
      // Opcional: Seleccionar el primer mensaje por defecto si hay alguno
      if (data.length > 0) {
        setSelectedMessage(data[0]);
      }
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(filterStatus);
  }, [filterStatus]);

  if (loading) {
    return (
      <div className="admin-support-container">
        <p className="loading-text">Cargando mensajes...</p>
      </div>
    );
  }

    const handleReplySubmit = async () => {
        if (!selectedMessage || !replyText.trim()) {
            alert("Por favor, selecciona un mensaje y escribe una respuesta.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token.");
            return;
        }

        try {
            const res = await fetch(`https://localhost:4000/api/v1/support_messages/${selectedMessage.id}/reply`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reply_content: replyText, // El nombre debe coincidir con params[:reply_content] en Rails
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error al enviar la respuesta.");
            }

            alert("Respuesta enviada con éxito.");
            setReplyText("");

        } catch (error) {
            console.error("Error al enviar la respuesta:", error);
            alert(`Fallo al enviar la respuesta: ${error.message}`);
        }
    };

  return (
    <div className="admin-support-layout">
      <div className="admin-support-panel-left">
        <h1 className="admin-support-title">Mensajes de soporte</h1>
        <div className="message-filter-controls">
          <label htmlFor="status-filter">Filtrar por estado:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)} // Esto dispara el useEffect
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="replied">Respondido</option>
            </select>
        </div>
        {messages.length === 0 ? (
          <p className="no-messages-text">No hay mensajes aún.</p>
        ) : (
          <div className="message-list-scrollable">
            {messages.map((msg) => (
              <div
                key={msg.id}
                // Compara con selectedMessage.id para aplicar la clase
                className={`message-card ${
                  selectedMessage && selectedMessage.id === msg.id ? "message-card-selected" : ""
                }`}
                onClick={() => setSelectedMessage(msg)} // Al hacer clic, guarda el objeto completo
              >
                <div className="message-header">
                  <div className="message-icon">
                    {msg.order.user.nombre ? msg.order.user.nombre[0].toUpperCase() : "?"}
                  </div>
                  <div className="message-info">
                    <h3 className="message-title">
                      {msg.order.user.nombre} {msg.order.user.apellido}
                    </h3>
                    <p className="message-subtitle">{msg.order.correo_cliente}</p>
                    
                    {msg.replied ? (
                      <span className="status-badge status-replied">
                        RESPONDIDO
                      </span>
                    ) : (
                      <span className="status-badge status-pending">
                        PENDIENTE
                      </span>
                    )}
                    
                  </div>
                  <div className="message-meta">
                    <span className="message-date">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {/* Ahora el asunto se muestra siempre, pero el mensaje completo va al panel derecho */}
                <p className="message-subject">
                  <strong>Asunto:</strong> {msg.subject}
                </p>
                {/* Puedes añadir una pequeña preview del mensaje aquí si quieres */}
                <p className="message-preview">
                  {msg.message_text.substring(0, 70)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-support-panel-right"> {/* Panel derecho para los detalles */}
        {selectedMessage ? (
          <div className="message-details-card">
            <div className="details-header">
              <div className="details-icon">
                {selectedMessage.order.user.nombre ? selectedMessage.order.user.nombre[0].toUpperCase() : "?"}
              </div>
              <div className="details-info">
                <h2>{selectedMessage.order.user.nombre} {selectedMessage.order.user.apellido}</h2>
                <p className="details-email">{selectedMessage.order.correo_cliente}</p>
              </div>
              <span className="details-date">
                {new Date(selectedMessage.created_at).toLocaleString()}
              </span>
            </div>
            
            <div className="details-section">
              <h3>numero de orden:</h3>
              <p>{selectedMessage.order.numero_de_orden}</p>
            </div>

            <div className="details-section message-text-section">
              <h3>Mensaje:</h3>
              <div className="details-message-content">
                <p>{selectedMessage.message_text}</p>
              </div>
            </div>

            {/* Aquí podrías añadir un campo para responder al mensaje */}
            <div className="reply-section">
                <textarea
                    placeholder="Escribe tu respuesta..."
                    className="reply-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <button className="reply-button" onClick={handleReplySubmit}>
                    Enviar Respuesta
                </button>
            </div>
          </div>
        ) : (
          <div className="no-message-selected">
            <p>Selecciona un mensaje para ver los detalles</p>
            <span role="img" aria-label="point left">👈</span>
          </div>
        )}
      </div>
    </div>
  );
}