import React, { useState, useRef, useEffect } from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

function FloatingChat() {
  const [token, setToken] = useState(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();
  const [loading, setLoading] = useState(false);

  const bienvenida = {
    from: 'ai',
    text: '¡Hola! Soy Amélie, tu asistente de belleza. ¿En qué te puedo ayudar hoy?'
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  const handleOpenChat = () => {
    setOpen(true);
    // Solo agrega bienvenida si todavía no hay mensajes
    setMessages(prev => (prev.length === 0 ? [bienvenida] : prev));
  };
  

  // Enviar mensaje a backend (Gemini)
  const sendMessage = async () => {
    if (!token) return;
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setLoading(true); 
    // Petición al backend
    try {
      const res = await fetch('https://localhost:4000/api/v1/api/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'ai', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: 'ai', text: 'Error al obtener respuesta.' }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            background: '#c2185b',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.16)',
            cursor: 'pointer'
          }}
          onClick={handleOpenChat}
          aria-label="Abrir chat IA"
        >
          <ChatIcon style={{ color: '#fff', fontSize: 32 }} />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 340,
            maxWidth: '95vw',
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 4px 32px rgba(0,0,0,0.32)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', padding: 12, background: '#c2185b', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
            <span style={{ color: '#fff', fontWeight: 600, flex: 1 }}>Amélie</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setOpen(false)}>
              <CloseIcon style={{ color: '#fff' }} />
            </button>
          </div>
       

          <div style={{ flex: 1, padding: 12, maxHeight: 320, overflowY: 'auto' }}>
            {messages.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>¡Hola! ¿En qué puedo ayudarte sobre cosméticos?</div>}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ margin: '6px 0', textAlign: msg.from === 'user' ? 'right' : 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: msg.from === 'user' ? '#f8bbd0' : '#f1f1f1',
                    color: '#222',
                    borderRadius: 8,
                    padding: '6px 12px',
                    maxWidth: '80%',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {/* Indicador de cargando */}
            {loading && (
              <div style={{ margin: '6px 0', textAlign: 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#f1f1f1',
                    color: '#c2185b',
                    borderRadius: 8,
                    padding: '6px 12px',
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    fontStyle: 'italic'
                  }}
                >
                  Amélie está escribiendo...
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #f3e5f5', padding: 8 }}>
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !loading) sendMessage();
              }}
              placeholder="Escribe tu pregunta..."
              style={{ flex: 1, border: 'none', outline: 'none', padding: 8, fontSize: 15 }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              style={{
                background: '#c2185b',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 15px',
                marginLeft: 8,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChat;