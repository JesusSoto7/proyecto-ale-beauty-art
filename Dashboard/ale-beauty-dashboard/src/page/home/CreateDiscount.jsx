import React, { useEffect, useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";

export default function CreateDiscount() {
  // today string YYYY-MM-DD (local)
  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();


  const [token, setToken] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    tipo: "porcentaje",
    valor: "",
    fecha_inicio: today, // <- por defecto hoy (local)
    fecha_fin: "",
    activo: true,
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoadingTable(true);
    fetch("https://localhost:4000/api/v1/discounts", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDiscounts(data))
      .finally(() => setLoadingTable(false));
  }, [token, msg]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validar en tiempo real el campo modificado
    setValidationErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // Validaciones cliente
  function validateDiscount(values) {
    const errors = {};
    // const today = new Date().toISOString().slice(0,10); // ya se tiene arriba

    // nombre
    if (!values.nombre || values.nombre.trim().length < 2) {
      errors.nombre = "El nombre es obligatorio (min 2 caracteres).";
    } else if (values.nombre.trim().length > 100) {
      errors.nombre = "El nombre no puede tener más de 100 caracteres.";
    }

    // tipo
    if (!["porcentaje", "monto_fijo"].includes(values.tipo)) {
      errors.tipo = "Tipo inválido.";
    }

    // valor
    if (values.valor === "" || values.valor === null || Number.isNaN(Number(values.valor))) {
      errors.valor = "El valor es obligatorio y debe ser un número.";
    } else {
      const v = Number(values.valor);
      if (v < 0) errors.valor = "El valor debe ser mayor o igual a 0.";
      if (values.tipo === "porcentaje") {
        if (v <= 0) errors.valor = "El porcentaje debe ser mayor que 0.";
        if (v > 100) errors.valor = "El porcentaje no puede superar 100.";
      }
    }

    // fecha_inicio
    if (!values.fecha_inicio) {
      errors.fecha_inicio = "La fecha de inicio es obligatoria.";
    } else {
      if (values.fecha_inicio < "1900-01-01") {
        errors.fecha_inicio = "Fecha de inicio inválida.";
      }
      // permitimos fecha_inicio === today (no la marcamos como error)
    }

    // fecha_fin
    if (values.fecha_fin) {
      if (!values.fecha_inicio) {
        errors.fecha_fin = "Indica primero la fecha de inicio.";
      } else if (values.fecha_fin < values.fecha_inicio) {
        errors.fecha_fin = "La fecha fin debe ser igual o posterior a la fecha de inicio.";
      }
    }

    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const errors = validateDiscount(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMsg("Corrige los errores del formulario.");
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        setMsg("No autenticado.");
        setLoading(false);
        return;
      }
      const url = editingId
        ? `https://localhost:4000/api/v1/discounts/${editingId}`
        : "https://localhost:4000/api/v1/discounts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ discount: form }),
      });
      const data = await res.json();

      if (!res.ok) {
        const backendErrors = {};
        if (data && data.errors) {
          if (Array.isArray(data.errors)) {
            backendErrors._server = data.errors.join(", ");
          } else if (typeof data.errors === "object") {
            Object.keys(data.errors).forEach(k => backendErrors[k] = data.errors[k].join ? data.errors[k].join(", ") : data.errors[k]);
          } else {
            backendErrors._server = String(data.errors);
          }
        } else if (data && data.error) {
          backendErrors._server = data.error;
        } else {
          backendErrors._server = "Error al guardar el descuento.";
        }
        setValidationErrors(backendErrors);
        setMsg("No se pudo guardar el descuento");
        setLoading(false);
        return;
      }

      setMsg(editingId ? "¡Descuento editado!" : "¡Descuento creado!");
      setForm({
        nombre: "",
        descripcion: "",
        tipo: "porcentaje",
        valor: "",
        fecha_inicio: today, // al limpiar volver a hoy
        fecha_fin: "",
        activo: true,
      });
      setEditingId(null);
      setValidationErrors({});
    } catch (err) {
      setMsg("No se pudo guardar el descuento");
    }
    setLoading(false);
  };
  
  // Función robusta que determina si un descuento está activo comparando fechas como fechas (no strings).
  function esDescuentoActivo(desc) {
    if (!desc) return false;

    // Si el backend envía fecha como "YYYY-MM-DD" o como ISO, manejamos ambos.
    let fechaInicio = desc.fecha_inicio;
    let fechaFin = desc.fecha_fin;

    if (!fechaInicio) return false;

    try {
      // Normalizar a objeto Date y llevar a medianoche local
      const toLocalDateStart = (d) => {
        const dt = new Date(d);
        dt.setHours(0,0,0,0);
        return dt.getTime();
      };
      const inicioMs = toLocalDateStart(fechaInicio);
      const hoyMs = toLocalDateStart(new Date());
      const finMs = fechaFin ? toLocalDateStart(fechaFin) : null;

      if (!desc.activo) return false;
      if (inicioMs > hoyMs) return false; // comienza en el futuro
      if (finMs !== null && finMs < hoyMs) return false; // ya terminó
      return true;
    } catch (err) {
      // En caso de error al parsear, fallback a comprobación string (menos fiable)
      const hoy = new Date().toISOString().slice(0,10);
      return desc.activo && desc.fecha_inicio <= hoy && (!desc.fecha_fin || desc.fecha_fin >= hoy);
    }
  }

  const handleEdit = (desc) => {
    setForm({
      nombre: desc.nombre || "",
      descripcion: desc.descripcion || "",
      tipo: desc.tipo || "porcentaje",
      valor: desc.valor || "",
      fecha_inicio: desc.fecha_inicio ? desc.fecha_inicio.substring(0, 10) : today,
      fecha_fin: desc.fecha_fin ? desc.fecha_fin.substring(0, 10) : "",
      activo: desc.activo ?? true,
    });
    setEditingId(desc.id);
    setMsg("");
    setValidationErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este descuento?")) return;
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`https://localhost:4000/api/v1/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al borrar");
      setMsg("¡Descuento eliminado!");
    } catch {
      setMsg("No se pudo eliminar");
    }
    setLoading(false);
  };

  // estilos y render
  const cardStyle = { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.10)", padding: "2em", margin: "2em auto", maxWidth: 600, border: "1px solid #eee" };
  const wideCardStyle = { ...cardStyle, maxWidth: 900, minHeight: 340, overflowX: "auto" };
  const inputStyle = { width: "100%", padding: "0.75em", margin: "0.5em 0 1em 0", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1em", background: "#fafbfc" };
  const labelStyle = { fontWeight: 500, marginBottom: "0.2em", display: "block" };
  const buttonStyle = { padding: "0.7em 1.5em", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", marginTop: "0.5em", marginRight: "0.5em" };
  const cancelStyle = { ...buttonStyle, background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" };
  const errorMsgStyle = { marginTop: "1em", color: "#dc2626", fontWeight: 500 };
  const successMsgStyle = { marginTop: "1em", color: "#16a34a", fontWeight: 500 };
  const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "10px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", minHeight: "160px", tableLayout: "fixed" };
  const thTdStyle = { borderBottom: "1px solid #eee", padding: "0.7em", textAlign: "left" };

  return (
    <div>
      <div style={cardStyle}>
        <form onSubmit={handleSubmit} noValidate>
          <h2 style={{marginBottom:"1.5em"}}>{editingId ? "Editar descuento" : "Crear descuento"}</h2>

          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="nombre" style={inputStyle} value={form.nombre} onChange={handleChange} required />
            {validationErrors.nombre && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.nombre}</div>}
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea name="descripcion" style={{...inputStyle, minHeight: "60px"}} value={form.descripcion} onChange={handleChange} />
            {validationErrors.descripcion && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.descripcion}</div>}
          </div>

          <div>
            <label style={labelStyle}>Tipo</label>
            <select name="tipo" style={inputStyle} value={form.tipo} onChange={handleChange}>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto fijo</option>
            </select>
            {validationErrors.tipo && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.tipo}</div>}
          </div>

          <div>
            <label style={labelStyle}>Valor</label>
            <input
              name="valor"
              type="number"
              style={inputStyle}
              value={form.valor}
              onChange={handleChange}
              required
              min={0}
              step={form.tipo === 'porcentaje' ? "0.1" : "0.01"}
              max={form.tipo === 'porcentaje' ? 100 : undefined}
            />
            {validationErrors.valor && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.valor}</div>}
          </div>

          <div style={{display:"flex", gap:"1em"}}>
            <div style={{flex:1}}>
              <label style={labelStyle}>Fecha inicio</label>
              <input name="fecha_inicio" type="date" style={inputStyle} value={form.fecha_inicio} onChange={handleChange} required min={today} />
              {validationErrors.fecha_inicio && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.fecha_inicio}</div>}
            </div>
            <div style={{flex:1}}>
              <label style={labelStyle}>Fecha fin</label>
              <input name="fecha_fin" type="date" style={inputStyle} value={form.fecha_fin} onChange={handleChange} min={form.fecha_inicio || today} />
              {validationErrors.fecha_fin && <div style={{color:'#dc2626', marginTop:6}}>{validationErrors.fecha_fin}</div>}
            </div>
          </div>

          <div style={{margin:"1em 0"}}>
            <label style={{...labelStyle, display: "inline-flex", alignItems:"center", gap: "0.5em"}}>
              <input name="activo" type="checkbox" checked={form.activo} onChange={handleChange} style={{width:"1em", height:"1em"}} />
              Activo
            </label>
          </div>

          <div>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Guardando..." : (editingId ? "Guardar cambios" : "Crear descuento")}
            </button>
            {editingId && (
              <button type="button" style={cancelStyle} onClick={() => {
                setEditingId(null);
                setForm({ nombre: "", descripcion: "", tipo: "porcentaje", valor: "", fecha_inicio: today, fecha_fin: "", activo: true });
                setValidationErrors({});
              }}>
                Cancelar
              </button>
            )}
            {msg && (
              <div style={msg.includes("No se pudo") ? errorMsgStyle : successMsgStyle}>
                {msg}
              </div>
            )}
            {validationErrors._server && <div style={errorMsgStyle}>{validationErrors._server}</div>}
          </div>
        </form>
      </div>

      <div style={wideCardStyle}>
        <h3 style={{marginBottom:"1em"}}>Descuentos creados</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{background:"#f3f4f6"}}>
              <th style={thTdStyle}>Nombre</th>
              <th style={thTdStyle}>Tipo</th>
              <th style={thTdStyle}>Valor</th>
              <th style={thTdStyle}>Fecha inicio</th>
              <th style={thTdStyle}>Fecha fin</th>
              <th style={thTdStyle}>Activo</th>
              <th style={thTdStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan={7} style={{textAlign:"center", padding:"2em"}}>
                  <CircularProgress color="primary" />
                  <div style={{color:"#2563eb", fontWeight:600, marginTop:"0.7em"}}>Cargando descuentos...</div>
                </td>
              </tr>
            ) : discounts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{textAlign:"center", color:"#6b7280", fontWeight:500, padding:"2em"}}>
                  No hay descuentos todavía.
                </td>
              </tr>
            ) : (
              discounts.map(desc => (
                <tr key={desc.id}>
                  <td style={thTdStyle}>{desc.nombre}</td>
                  <td style={thTdStyle}>{desc.tipo}</td>
                  <td style={thTdStyle}>
                    {desc.tipo === "porcentaje" ? `${desc.valor}%` : `$${desc.valor}`}
                  </td>
                  <td style={thTdStyle}>
                    {desc.fecha_inicio?.substring(0,10) || "-"}
                  </td>
                  <td style={thTdStyle}>
                    {desc.fecha_fin?.substring(0,10) || "Sin límite"}
                  </td>
                  <td style={thTdStyle}>
                    {desc ? (
                      esDescuentoActivo(desc)
                        ? <span style={{color:"#16a34a", fontWeight:600}}>Sí</span>
                        : <span style={{color:"#dc2626", fontWeight:600}}>No</span>
                    ) : ""}
                  </td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleEdit(desc)} style={{ ...buttonStyle, background: "#f59e42", color: "#fff", padding: "0.5em 1em", fontSize: "0.92em" }}>Editar</button>
                    <button onClick={() => handleDelete(desc.id)} style={{ ...buttonStyle, background: "#dc2626", color: "#fff", padding: "0.5em 1em", fontSize: "0.92em" }}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}