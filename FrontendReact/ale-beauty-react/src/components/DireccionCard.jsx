import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react"; // <-- ícono bonito opcional

export default function DireccionCard({ address, onEdit }) {
  if (!address) return null;

  return (
    <div className="direccion-card" style={styles.card}>
      <div style={styles.content}>
        <p style={styles.name}>
          <strong>{address.nombre} {address.apellido}</strong>
        </p>
        <p style={styles.text}>{address.direccion}</p>
        <p style={styles.text}>
          <span style={styles.label}>Barrio:</span>{" "}
          {address.neighborhood?.nombre || "Sin barrio"}
        </p>
      </div>

      <div style={styles.actions}>
        <button style={styles.button} onClick={onEdit}>
          <Edit2 size={16} style={{ marginRight: "6px" }} />
          Editar
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #f8bbd0",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff0f6",
    boxShadow: "0 4px 10px rgba(240, 98, 146, 0.2)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  content: { flex: 1 },
  name: {
    fontSize: "16px",
    color: "#ad1457",
    marginBottom: "6px",
  },
  text: {
    fontSize: "14px",
    color: "#444",
    margin: "2px 0",
  },
  label: {
    fontWeight: "bold",
    color: "#c2185b",
  },
  actions: { marginLeft: "12px" },
  button: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f06292",
    border: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background 0.3s ease, transform 0.2s ease",
  },
};
