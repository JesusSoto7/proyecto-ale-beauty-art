import React, { useEffect, useMemo, useRef, useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const STATUS = ["pendiente", "pagada", "preparando", "enviado", "entregado", "cancelada"];

const STATUS_STYLES = {
  pagada: { bg: "#ecfdf5", color: "#065f46" },
  pendiente: { bg: "#f3f4f6", color: "#374151" },
  preparando: { bg: "#eff6ff", color: "#1d4ed8" },
  enviado: { bg: "#f5f3ff", color: "#6d28d9" },
  entregado: { bg: "#ecfeff", color: "#0f766e" },
  cancelada: { bg: "#fef2f2", color: "#991b1b" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [qInput, setQInput] = useState("");           // entrada cruda
  const [q, setQ] = useState("");                     // valor debounced
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);       // carga inicial
  const [searching, setSearching] = useState(false);  // indicador ligero al buscar/cambiar filtro
  const [savingId, setSavingId] = useState(null);
  const token = useMemo(() => localStorage.getItem("token") || "", []);
  const didMountRef = useRef(false);

  // Debounce 400ms para la búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQ(qInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [qInput]);

  const fetchOrders = () => {
    if (didMountRef.current) {
      setSearching(true);
    } else {
      setLoading(true);
    }

    const params = new URLSearchParams();
    if (q) params.set("query", q);
    if (status) params.set("status", status);
    params.set("page", page);
    params.set("per", per);

    fetch(`https://localhost:4000/api/v1/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autorizado o error de servidor");
        return res.json();
      })
      .then((json) => {
        setOrders(json.data || []);
        setTotal(json.pagination?.total || 0);
      })
      .catch((err) => alert(err.message))
      .finally(() => {
        if (didMountRef.current) {
          setSearching(false);
        } else {
          setLoading(false);
          didMountRef.current = true;
        }
      });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, page, per]);

  // Evita quedar fuera de rango si cambia el total
  useEffect(() => {
    const tp = Math.max(1, Math.ceil((total || 0) / (per || 1)));
    if (page > tp) setPage(tp);
  }, [total, per]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChangeStatus = (orderId, newStatus) => {
    if (!window.confirm(`Cambiar estado a "${newStatus}"?`)) return;
    setSavingId(orderId);
    fetch(`https://localhost:4000/api/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo actualizar el estado");
        return res.json();
      })
      .then(() => fetchOrders())
      .catch((err) => alert(err.message))
      .finally(() => setSavingId(null));
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <span>Cargando órdenes...</span>
      </div>
    );
  }

  const badgeStyle = (st) => {
    const s = STATUS_STYLES[st] || { bg: "#f3f4f6", color: "#374151" };
    return {
      padding: "2px 8px",
      borderRadius: 999,
      background: s.bg,
      color: s.color,
      border: "1px solid #e5e7eb",
      fontSize: 12,
      fontWeight: 600
    };
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / (per || 1)));
  const start = total > 0 ? (page - 1) * per + 1 : 0;
  const end = total > 0 ? Math.min(page * per, total) : 0;

  const btnBase = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
  };
  const btnDisabled = { ...btnBase, background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed", opacity: 0.7 };
  const btnPrimary = { ...btnBase, background: "#f9fafb" };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Órdenes</h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Buscar (orden o correo)"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          style={{ padding: 8, minWidth: 240, border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          <option value="">Todos</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={per}
          onChange={(e) => { setPage(1); setPer(Number(e.target.value)); }}
          style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 }}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>{n}/página</option>
          ))}
        </select>

        {searching && <span style={{ color: "#6b7280", fontSize: 12 }}>Buscando…</span>}
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "background.paper" }}>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Fecha</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Numero Orden</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Cliente</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Correo</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Total</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Estado</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Detalles</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #eee" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
                <td style={{ padding: 8 }}>{o.numero_de_orden}</td>
                <td style={{ padding: 8 }}>{o.clientes || "-"}</td>
                <td style={{ padding: 8 }}>{o.correo_cliente || o.email || "-"}</td>
                <td style={{ padding: 8 }}>${Number(o.pago_total || 0).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <span style={badgeStyle(o.status)}>{o.status}</span>
                </td>
                <td style={{ padding: 8 }}>
                  {o.pdf_url ? (
                    <a
                      href={o.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver factura"
                      style={{ color: "red", display: "inline-flex", alignItems: "center" }}
                    >
                      <DescriptionIcon fontSize="small" />
                    </a>
                  ) : (
                    <InsertDriveFileIcon fontSize="small" style={{ color: "grey" }} titleAccess="Sin factura" />
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={o.status}
                    onChange={(e) => onChangeStatus(o.id, e.target.value)}
                    disabled={savingId === o.id}
                    style={{ padding: 6, border: "1px solid #e5e7eb", borderRadius: 6 }}
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {savingId === o.id && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>Guardando…</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={page <= 1 ? btnDisabled : btnPrimary}
          aria-label="Anterior"
        >
          Anterior
        </button>

        <span style={{ color: "#374151" }}>
          Página {page} de {totalPages} · Mostrando {start}–{end} de {total}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={page >= totalPages ? btnDisabled : btnPrimary}
          aria-label="Siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}