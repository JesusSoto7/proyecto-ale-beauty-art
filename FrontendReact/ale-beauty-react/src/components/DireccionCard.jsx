import { useState, useEffect } from "react";

export default function DireccionCard({ address, onEdit }) {
  if (!address) return null;

  return (
    <div className="direccion-card" style={styles.card}>
      <div style={styles.content}>
        <p>
          <strong>{address.nombre} {address.apellido}</strong>
        </p>
        <p>{address.direccion}</p>
        <p>
          Barrio: {address.neighborhood?.nombre || "Sin barrio"}
        </p>
      </div>

      <div style={styles.actions}>
        <button onClick={onEdit}>Editar</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: { flex: 1 },
  actions: { marginLeft: "10px" },
};
