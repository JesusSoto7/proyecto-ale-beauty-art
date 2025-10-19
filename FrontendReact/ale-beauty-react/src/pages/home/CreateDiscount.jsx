import React, { useEffect, useState } from 'react';


export default function CreateDiscount() {
  const [token, setToken] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "porcentaje",
    valor: "",
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");  
  
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      if (!token) return;
      const res = await fetch("https://localhost:4000/api/v1/discounts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
         },
        body: JSON.stringify({ discount: form }),
      });
      if (!res.ok) throw new Error("Error al crear descuento");
      setMsg("¡Descuento creado!");
      setForm({
        nombre: "",
        descripcion: "",
        tipo: "porcentaje",
        valor: "",
        fecha_inicio: "",
        fecha_fin: "",
        activo: true,
      });
    } catch {
      setMsg("No se pudo crear el descuento");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2em auto" }}>
      <h2>Crear Descuento</h2>
      <label>Nombre</label>
      <input name="nombre" value={form.nombre} onChange={handleChange} required />

      <label>Descripción</label>
      <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />

      <label>Tipo</label>
      <select name="tipo" value={form.tipo} onChange={handleChange}>
        <option value="porcentaje">Porcentaje</option>
        <option value="monto_fijo">Monto Fijo</option>
      </select>

      <label>Valor</label>
      <input name="valor" type="number" value={form.valor} onChange={handleChange} required />

      <label>Fecha inicio</label>
      <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} required />

      <label>Fecha fin</label>
      <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} />

      <label>
        Activo
        <input name="activo" type="checkbox" checked={form.activo} onChange={handleChange} />
      </label>
      <br />
      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Crear Descuento"}
      </button>
      {msg && <div style={{ marginTop: "1em" }}>{msg}</div>}
    </form>
  );
}