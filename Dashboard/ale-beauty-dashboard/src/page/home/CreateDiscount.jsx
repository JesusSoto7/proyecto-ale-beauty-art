import React, { useEffect, useState } from 'react';
import { Box, Paper, CircularProgress, IconButton, Tooltip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../assets/stylesheets/createDiscounts.css";

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
    fecha_inicio: today,
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
      .then(data => setDiscounts(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTable(false));
  }, [token, msg]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  function validateDiscount(values) {
    const errors = {};
    if (!values.nombre || values.nombre.trim().length < 2) {
      errors.nombre = "El nombre es obligatorio (min 2 caracteres).";
    } else if (values.nombre.trim().length > 100) {
      errors.nombre = "El nombre no puede tener más de 100 caracteres.";
    }
    if (!["porcentaje", "monto_fijo"].includes(values.tipo)) {
      errors.tipo = "Tipo inválido.";
    }
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
    if (!values.fecha_inicio) {
      errors.fecha_inicio = "La fecha de inicio es obligatoria.";
    } else if (values.fecha_inicio < "1900-01-01") {
      errors.fecha_inicio = "Fecha de inicio inválida.";
    }
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
            Object.keys(data.errors).forEach(k => backendErrors[k] = Array.isArray(data.errors[k]) ? data.errors[k].join(", ") : data.errors[k]);
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
        fecha_inicio: today,
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

  function esDescuentoActivo(desc) {
    if (!desc) return false;
    let fechaInicio = desc.fecha_inicio;
    let fechaFin = desc.fecha_fin;
    if (!fechaInicio) return false;
    try {
      const toLocalDateStart = (d) => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt.getTime();
      };
      const inicioMs = toLocalDateStart(fechaInicio);
      const hoyMs = toLocalDateStart(new Date());
      const finMs = fechaFin ? toLocalDateStart(fechaFin) : null;
      if (!desc.activo) return false;
      if (inicioMs > hoyMs) return false;
      if (finMs !== null && finMs < hoyMs) return false;
      return true;
    } catch {
      const hoy = new Date().toISOString().slice(0, 10);
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

  return (
    <Box className="cd-root">
      {/* Formulario */}
      <Paper variant="outlined" elevation={0} className="cd-card">
        <form onSubmit={handleSubmit} noValidate>
          <h2 className="cd-title">{editingId ? "Editar descuento" : "Crear descuento"}</h2>

          <div className="cd-field">
            <label className="cd-label">Nombre</label>
            <input name="nombre" className="cd-input" value={form.nombre} onChange={handleChange} required />
            {validationErrors.nombre && <div className="cd-error">{validationErrors.nombre}</div>}
          </div>

          <div className="cd-field">
            <label className="cd-label">Descripción</label>
            <textarea name="descripcion" className="cd-input cd-textarea" value={form.descripcion} onChange={handleChange} />
            {validationErrors.descripcion && <div className="cd-error">{validationErrors.descripcion}</div>}
          </div>

          <div className="cd-field">
            <label className="cd-label">Tipo</label>
            <select name="tipo" className="cd-input" value={form.tipo} onChange={handleChange}>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto fijo</option>
            </select>
            {validationErrors.tipo && <div className="cd-error">{validationErrors.tipo}</div>}
          </div>

          <div className="cd-grid">
            <div className="cd-field">
              <label className="cd-label">Valor</label>
              <input
                name="valor"
                type="number"
                className="cd-input"
                value={form.valor}
                onChange={handleChange}
                required
                min={0}
                step={form.tipo === 'porcentaje' ? "0.1" : "0.01"}
                max={form.tipo === 'porcentaje' ? 100 : undefined}
              />
              {validationErrors.valor && <div className="cd-error">{validationErrors.valor}</div>}
            </div>

            <div className="cd-field">
              <label className="cd-label">Fecha inicio</label>
              <input name="fecha_inicio" type="date" className="cd-input" value={form.fecha_inicio} onChange={handleChange} required min={today} />
              {validationErrors.fecha_inicio && <div className="cd-error">{validationErrors.fecha_inicio}</div>}
            </div>

            <div className="cd-field">
              <label className="cd-label">Fecha fin</label>
              <input name="fecha_fin" type="date" className="cd-input" value={form.fecha_fin} onChange={handleChange} min={form.fecha_inicio || today} />
              {validationErrors.fecha_fin && <div className="cd-error">{validationErrors.fecha_fin}</div>}
            </div>
          </div>

          <div className="cd-switch">
            <label className="cd-checkbox">
              <input name="activo" type="checkbox" checked={form.activo} onChange={handleChange} />
              <span>Activo</span>
            </label>
          </div>

          <div className="cd-actionsRow">
            <Button type="submit" variant="contained" disableElevation disabled={loading}>
              {loading ? "Guardando..." : (editingId ? "Guardar cambios" : "Crear descuento")}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outlined"
                className="cd-btn cd-btn--ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm({ nombre: "", descripcion: "", tipo: "porcentaje", valor: "", fecha_inicio: today, fecha_fin: "", activo: true });
                  setValidationErrors({});
                }}
              >
                Cancelar
              </Button>
            )}
          </div>

          {msg && (
            <div className={`cd-msg ${msg.includes("No se pudo") ? "cd-msg--error" : "cd-msg--success"}`}>
              {msg}
            </div>
          )}
          {validationErrors._server && <div className="cd-msg cd-msg--error">{validationErrors._server}</div>}
        </form>
      </Paper>

      {/* Tabla */}
      <Paper variant="outlined" elevation={0} className="cd-card cd-card--wide">
        <h3 className="cd-subtitle">Descuentos creados</h3>

        <div className="cd-tableWrapper">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Activo</th>
                <th className="cd-colActions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={7}>
                    <div className="cd-loading">
                      <CircularProgress color="primary" size={24} />
                      <div className="cd-loadingText">Cargando descuentos...</div>
                    </div>
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cd-empty">
                    No hay descuentos todavía.
                  </td>
                </tr>
              ) : (
                discounts.map((desc) => (
                  <tr key={desc.id}>
                    <td>{desc.nombre}</td>
                    <td>{desc.tipo}</td>
                    <td>{desc.tipo === "porcentaje" ? `${desc.valor}%` : `$${desc.valor}`}</td>
                    <td>{desc.fecha_inicio?.substring(0, 10) || "-"}</td>
                    <td>{desc.fecha_fin?.substring(0, 10) || "Sin límite"}</td>
                    <td>
                      {desc ? (
                        esDescuentoActivo(desc)
                          ? <span className="cd-badge cd-badge--success">Sí</span>
                          : <span className="cd-badge cd-badge--danger">No</span>
                      ) : ""}
                    </td>
                    <td className="cd-actions">
                      <Tooltip title="Editar">
                        <IconButton
                          aria-label="Editar descuento"
                          size="small"
                          className="cd-iconBtn cd-iconBtn--edit"
                          onClick={() => handleEdit(desc)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          aria-label="Eliminar descuento"
                          size="small"
                          className="cd-iconBtn cd-iconBtn--delete"
                          onClick={() => handleDelete(desc.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Paper>
    </Box>
  );
}