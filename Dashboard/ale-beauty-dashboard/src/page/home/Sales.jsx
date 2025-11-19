import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, ToggleButtonGroup, ToggleButton,
  CircularProgress, FormControl, FormLabel, Stack, Alert, Divider, Chip, Button
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { BarChart } from "@mui/x-charts/BarChart";

const BASE_URL = "https://localhost:4000";
const API_PATH = "/api/v1/admin/orders";

function getToken() {
  return localStorage.getItem("token") || "";
}
const toISO = (d) => (d ? d.toDate().toISOString() : null);

// Opcional: limitar el tamaño del rango (días)
const MAX_RANGE_DAYS = 366;

async function fetchJSON(url) {
  const token = getToken();
  if (!token) throw new Error("No hay token (usuario no autenticado)");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    if (ct.includes("text/html")) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${text || "Fallo en la petición"}`);
  }
  return res.json();
}

export default function Sales() {
  // Fechas seleccionadas
  const [startDate, setStartDate] = useState(dayjs().subtract(13, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  // Filtros
  const [metric, setMetric] = useState("products"); // 'products' | 'revenue'
  const [level, setLevel] = useState("category");   // 'category' | 'subcategory'

  // Límites disponibles (desde primeras compras hasta hoy)
  const [bounds, setBounds] = useState({ min: null, max: dayjs().endOf("day") });
  const [boundsLoading, setBoundsLoading] = useState(true);
  const [dateNote, setDateNote] = useState(null);

  // Datos
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Cargar límites de fechas desde backend
  useEffect(() => {
    const loadBounds = async () => {
      try {
        setBoundsLoading(true);
        const json = await fetchJSON(`${BASE_URL}${API_PATH}/sales_bounds`);
        const min = json.min_date ? dayjs(json.min_date) : null;
        const max = dayjs(json.max_date || dayjs().endOf("day"));
        setBounds({ min, max });
        // Ajustar selección actual si está fuera de rango
        if (min) {
          let s = startDate;
          let e = endDate;
          if (s.isBefore(min)) s = min;
          if (e.isAfter(max)) e = max;
          if (s.isAfter(e)) e = s;
          setStartDate(s);
          setEndDate(e);
        } else {
          // No hay compras aún
          setDateNote("Aún no hay compras registradas; selecciona cuando existan datos.");
        }
      } catch (e) {
        setDateNote(`No se pudieron obtener los límites de fecha: ${e.message}`);
      } finally {
        setBoundsLoading(false);
      }
    };
    loadBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Asegurar start <= end y respetar límites al cambiar fechas
  useEffect(() => {
    if (!bounds.min || !bounds.max) return;
    let s = startDate;
    let e = endDate;
    let msg = null;

    // Clampear a límites
    if (s.isBefore(bounds.min)) { s = bounds.min; msg = "Inicio ajustado al primer día con compras."; }
    if (e.isAfter(bounds.max)) { e = bounds.max; msg = "Fin ajustado a hoy."; }
    if (s.isAfter(e)) { e = s; msg = "Fin ajustado para no ser menor al inicio."; }

    // Limitar tamaño del rango (opcional)
    if (e.diff(s, "day") + 1 > MAX_RANGE_DAYS) {
      e = s.add(MAX_RANGE_DAYS - 1, "day");
      if (e.isAfter(bounds.max)) e = bounds.max;
      msg = `Rango limitado a ${MAX_RANGE_DAYS} días.`;
    }

    if (!s.isSame(startDate)) setStartDate(s);
    if (!e.isSame(endDate)) setEndDate(e);
    setDateNote(msg);
  }, [startDate, endDate, bounds.min, bounds.max]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar datos
  useEffect(() => {
    if (!startDate || !endDate || boundsLoading) return;
    if (!bounds.min) return; // no hay compras
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("start_date", toISO(startDate.startOf("day")));
        params.append("end_date", toISO(endDate.endOf("day")));

        let endpoint = "";
        if (level === "category") {
          endpoint = metric === "products" ? "products_sold_by_category" : "sales_by_category";
        } else {
          endpoint = metric === "products" ? "products_sold_by_subcategory" : "sales_by_subcategory";
        }

        const url = `${BASE_URL}${API_PATH}/${endpoint}?${params.toString()}`;
        const json = await fetchJSON(url);

        const normalized = (json || []).map((row) => ({
          id: row.id,
          name: row.name,
          imagen_url: row.imagen_url || null,
          value:
            metric === "products"
              ? Number(row.total_products ?? row.total_qty ?? 0)
              : Number(row.total_sales ?? 0),
        }));

        setRows(normalized);

        const total = normalized.reduce((a, c) => a + (Number(c.value) || 0), 0);
        setSummary({ total, start: startDate.toDate(), end: endDate.toDate() });
      } catch (e) {
        setError(e.message);
        setRows([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [metric, level, startDate, endDate, boundsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAuthError = (msg) =>
    !!msg && (msg.includes("401") || msg.toLowerCase().includes("no autorizado") || msg.toLowerCase().includes("token"));

  const formatValue = (n) =>
    metric === "revenue" ? `$${Number(n || 0).toLocaleString()}` : `${Number(n || 0).toLocaleString()} uds`;

  const title =
    metric === "revenue"
      ? level === "category" ? "Ganancias por categoría" : "Ganancias por subcategoría"
      : level === "category" ? "Productos vendidos por categoría" : "Productos vendidos por subcategoría";

  const handleStartChange = (v) => {
    if (!v) return;
    if (bounds.min && v.isBefore(bounds.min)) {
      setStartDate(bounds.min);
      setDateNote("Inicio ajustado al primer día con compras.");
      return;
    }
    if (bounds.max && v.isAfter(bounds.max)) {
      setStartDate(bounds.max);
      setDateNote("Inicio ajustado a hoy.");
      return;
    }
    // asegurar no mayor al fin
    if (v.isAfter(endDate)) setEndDate(v);
    setStartDate(v);
  };

  const handleEndChange = (v) => {
    if (!v) return;
    if (bounds.min && v.isBefore(bounds.min)) {
      setEndDate(bounds.min);
      setDateNote("Fin ajustado al primer día con compras.");
      return;
    }
    if (bounds.max && v.isAfter(bounds.max)) {
      setEndDate(bounds.max);
      setDateNote("Fin ajustado a hoy.");
      return;
    }
    // asegurar no menor al inicio
    if (v.isBefore(startDate)) setStartDate(v);
    setEndDate(v);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <Typography variant="h4" fontWeight="bold">
          {level === "category" ? "Categorías" : "Subcategorías"} · {metric === "revenue" ? "Ganancias" : "Productos vendidos"}
        </Typography>

        {summary && (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                label={`Total: ${metric === "revenue"
                  ? `$${summary.total.toLocaleString()}`
                  : `${summary.total.toLocaleString()} uds`
                  }`}
                color={metric === "revenue" ? "secondary" : "primary"}
              />
              <Chip
                label={`Rango: ${dayjs(summary.start).format("DD/MM/YYYY")} - ${dayjs(summary.end).format("DD/MM/YYYY")}`}
              />
            </Stack>
          </Paper>
        )}

        <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          {boundsLoading && <Alert severity="info">Cargando límites de fechas…</Alert>}
          {!boundsLoading && !bounds.min && (
            <Alert severity="info">Aún no hay compras registradas. Cuando existan, aquí podrás filtrar por rango.</Alert>
          )}
          {dateNote && <Alert severity="info">{dateNote}</Alert>}

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <DatePicker
              label="Inicio"
              value={startDate}
              onChange={handleStartChange}
              minDate={bounds.min || undefined}
              maxDate={bounds.max || dayjs().endOf("day")}
              disableFuture
            />
            <DatePicker
              label="Fin"
              value={endDate}
              onChange={handleEndChange}
              minDate={bounds.min || undefined}
              maxDate={bounds.max || dayjs().endOf("day")}
              disableFuture
            />
          </Stack>

          <Stack direction="row" spacing={3} flexWrap="wrap">
            <FormControl>
              <FormLabel>Métrica</FormLabel>
              <ToggleButtonGroup value={metric} exclusive onChange={(_e, v) => v && setMetric(v)} size="small">
                <ToggleButton value="products">Productos vendidos</ToggleButton>
                <ToggleButton value="revenue">Ganancias ($)</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Nivel</FormLabel>
              <ToggleButtonGroup value={level} exclusive onChange={(_e, v) => v && setLevel(v)} size="small">
                <ToggleButton value="category">Categoría</ToggleButton>
                <ToggleButton value="subcategory">Subcategoría</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, minHeight: 380 }}>
          <Typography variant="h6" mb={2}>{title}</Typography>

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" height={240}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Alert
              severity={isAuthError(error) ? "warning" : "error"}
              action={
                isAuthError(error) ? (
                  <Button size="small" variant="outlined" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>
                    Login
                  </Button>
                ) : undefined
              }
            >
              {error}
            </Alert>
          )}

          {!loading && !error && rows.length === 0 && bounds.min && (
            <Box>No hay datos para el rango seleccionado.</Box>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              <BarChart
                height={300}
                series={[{
                  data: rows.map((c) => c.value),
                  label: metric === "revenue" ? "Ganancias ($)" : "Productos (uds)",
                  color: metric === "revenue" ? "#9c27b0" : "#1976d2",
                }]}
                xAxis={[{ data: rows.map((c) => c.name), scaleType: "band" }]}
                yAxis={[{ label: metric === "revenue" ? "Monto ($)" : "Cantidad (uds)" }]}
                tooltip={{ trigger: "item" }}
              />
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" gap={2} flexWrap="wrap">
                {rows.map((cat) => (
                  <Box
                    key={cat.id}
                    sx={{ width: 180, p: 1.5, border: "1px solid #e5e7eb", borderRadius: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
                  >
                    {cat.imagen_url && (
                      <img src={cat.imagen_url} alt={cat.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
                    )}
                    <Typography variant="body2" fontWeight="bold" textAlign="center">{cat.name}</Typography>
                    <Typography variant="caption">
                      {metric === "revenue"
                        ? `$${Number(cat.value || 0).toLocaleString()}`
                        : `${Number(cat.value || 0).toLocaleString()} uds`
                      }
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}