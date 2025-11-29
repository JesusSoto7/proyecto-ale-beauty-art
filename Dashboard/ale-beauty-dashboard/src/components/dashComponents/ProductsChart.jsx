import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneIcon from '@mui/icons-material/Done';
import { LineChart } from '@mui/x-charts/LineChart';

const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:4000';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.55} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
AreaGradient.propTypes = { color: PropTypes.string.isRequired, id: PropTypes.string.isRequired };

// Helpers --------------------------------------------------
function getPresetRange(option) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  switch (option) {
    case 'last_7': {
      const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { start: iso(start), end: iso(end), label: 'Últimos 7 días', param: 'last_7' };
    }
    case 'this_month': {
      const start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
      const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      return { start: iso(start), end: iso(end), label: 'Este mes', param: 'this_month' };
    }
    case 'last_month': {
      const start = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1));
      const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0));
      return { start: iso(start), end: iso(end), label: 'Mes anterior', param: 'last_month' };
    }
    case 'last_90': {
      const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const start = new Date(end);
      start.setDate(start.getDate() - 89);
      return { start: iso(start), end: iso(end), label: 'Últimos 90 días', param: 'last_90' };
    }
    case 'last_30':
    default: {
      const end = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const start = new Date(end);
      start.setDate(start.getDate() - 29);
      return { start: iso(start), end: iso(end), label: 'Últimos 30 días', param: 'last_30' };
    }
  }
}

function formatXAxisLabels(isoDates) {
  if (!isoDates || isoDates.length === 0) return [];
  const dates = isoDates.map((d) => new Date(d)).filter((d) => !isNaN(d.getTime()));
  const sameMonth = dates.every(
    (d) => d.getMonth() === dates[0].getMonth() && d.getFullYear() === dates[0].getFullYear()
  );
  const locale = 'es-CO';
  if (sameMonth) {
    return dates.map((d) => d.getDate().toString().padStart(2, '0'));
  }
  return dates.map((d) =>
    d.toLocaleDateString(locale, {
      month: 'short',
      day: '2-digit',
    })
  );
}

// Componente principal --------------------------------------------------
export default function ProductsChart() {
  const theme = useTheme();

  // Auth
  const [token, setToken] = React.useState(null);

  // Datos
  const [chartData, setChartData] = React.useState({
    rawLabels: [],
    labels: [],
    values: { view_item: [], add_to_cart: [], purchase: [] },
    start_date: null,
    end_date: null,
    label: null,
  });

  // UI state
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Rango seleccionado
  const [rangeOption, setRangeOption] = React.useState('last_30');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [pendingCustom, setPendingCustom] = React.useState(false);

  // Guardar token inicial
  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
    else setError(new Error('No autenticado. Inicia sesión para ver el embudo.'));
  }, []);

  // Construcción de URL
  const buildUrl = React.useCallback(() => {
    let base = `${API_BASE}/api/v1/analytics/product_funnel_per_day`;
    if (rangeOption !== 'custom') {
      return `${base}?range=${rangeOption}`;
    }
    if (customStart && customEnd) {
      const params = new URLSearchParams({
        start_date: customStart,
        end_date: customEnd,
      }).toString();
      return `${base}?${params}`;
    }
    // Si falta rango personalizado, cae a last_30 temporalmente
    return `${base}?range=last_30`;
  }, [rangeOption, customStart, customEnd]);

  // Carga
  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const url = buildUrl();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const contentType = res.headers.get('content-type') || '';
      let data = null;

      try {
        data = contentType.includes('application/json') ? await res.json() : await res.text();
      } catch {
        data = null;
      }

      if (!res.ok || typeof data !== 'object' || data === null) {
        const message =
          (data && (data.error || data.message)) ||
          res.statusText ||
          `Error ${res.status}`;
        throw Object.assign(new Error(message), { status: res.status });
      }

      // Asegurarse de incluir el día actual si falta
      const rawLabels = Array.isArray(data.labels) ? data.labels : [];
      const currentDay = new Date().toISOString().slice(0, 10);
      if (!rawLabels.includes(currentDay)) {
        rawLabels.push(currentDay); // Añadir día actual
      }

      const formattedLabels = formatXAxisLabels(rawLabels);
      const values = data.values || {};

      // Asegúrate de extender valores para el día actual
      const extendValuesToToday = (key) => {
        const existing = Array.isArray(values[key]) ? values[key] : [];
        if (existing.length < rawLabels.length) {
          const difference = rawLabels.length - existing.length;
          return [...existing, ...Array(difference).fill(0)];
        }
        return existing;
      };

      setChartData({
        rawLabels,
        labels: formattedLabels,
        values: {
          view_item: extendValuesToToday('view_item'),
          add_to_cart: extendValuesToToday('add_to_cart'),
          purchase: extendValuesToToday('purchase'),
        },
        start_date: data.start_date,
        end_date: data.end_date,
        label: data.label,
      });
    } catch (e) {
      setChartData({
        rawLabels: [],
        labels: [],
        values: { view_item: [], add_to_cart: [], purchase: [] },
        start_date: null,
        end_date: null,
        label: null,
      });
      setError(e);

      if (e.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        setTimeout(() => (window.location.href = `/login`), 0);
      }
    } finally {
      setLoading(false);
      setPendingCustom(false);
    }
  }, [token, buildUrl]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Handlers rango
  const handleRangeChange = (e) => {
    const value = e.target.value;
    setRangeOption(value);
    if (value !== 'custom') {
      // reset custom para no confundir
      setCustomStart('');
      setCustomEnd('');
      setPendingCustom(false);
    }
  };
  const applyCustomRange = () => {
    if (!customStart || !customEnd) {
      setError(new Error('Seleccione fecha inicio y fin'));
      return;
    }
    setPendingCustom(true);
    load();
  };

  const refresh = () => {
    load();
  };

  // Totales
  const totalView = chartData.values.view_item.reduce((a, b) => a + b, 0);
  const totalCart = chartData.values.add_to_cart.reduce((a, b) => a + b, 0);
  const totalBuy = chartData.values.purchase.reduce((a, b) => a + b, 0);

  const conversionCart = totalView > 0 ? (totalCart / totalView) * 100 : 0;
  const conversionBuy = totalView > 0 ? (totalBuy / totalView) * 100 : 0;

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  // UI -------------------------------------------------------
  if (error && !loading && chartData.labels.length === 0) {
    return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Typography component="h2" variant="subtitle2" gutterBottom>
            Embudo de productos
          </Typography>
          <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
            {error.message}
          </Typography>
          <Box>
            <TextField
              select
              label="Rango"
              size="small"
              value={rangeOption}
              onChange={handleRangeChange}
              sx={{ mr: 1, minWidth: 160 }}
            >
              <MenuItem value="last_7">Últimos 7 días</MenuItem>
              <MenuItem value="this_month">Este mes</MenuItem>
              <MenuItem value="last_month">Mes anterior</MenuItem>
              <MenuItem value="last_30">Últimos 30 días</MenuItem>
              <MenuItem value="last_90">Últimos 90 días</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </TextField>
            <IconButton onClick={refresh} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        {/* Barra superior de controles */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Typography component="h2" variant="subtitle2" gutterBottom sx={{ mb: 0 }}>
            Embudo de productos
          </Typography>

          <TextField
            select
            label="Rango"
            size="small"
            value={rangeOption}
            onChange={handleRangeChange}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="last_7">Últimos 7 días</MenuItem>
            <MenuItem value="this_month">Este mes</MenuItem>
            <MenuItem value="last_month">Mes anterior</MenuItem>
            <MenuItem value="last_30">Últimos 30 días</MenuItem>
            <MenuItem value="last_90">Últimos 90 días</MenuItem>
            <MenuItem value="custom">Personalizado</MenuItem>
          </TextField>

          {rangeOption === 'custom' && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <TextField
                label="Inicio"
                type="date"
                size="small"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fin"
                type="date"
                size="small"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Tooltip title="Aplicar rango">
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={applyCustomRange}
                    disabled={!customStart || !customEnd || loading}
                  >
                    <DoneIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}

          <Tooltip title="Refrescar">
            <span>
              <IconButton
                aria-label="Refrescar"
                onClick={refresh}
                size="small"
                disabled={loading}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Totales y conversiones */}
        <Stack sx={{ justifyContent: 'space-between', mb: 1 }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h5" component="p">
              {totalView} vistos · {totalCart} al carrito ({conversionCart.toFixed(1)}%) · {totalBuy} comprados ({conversionBuy.toFixed(1)}%)
            </Typography>
            <Chip size="small" color="success" label="+35%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {rangeOption === 'custom' && chartData.start_date && chartData.end_date
              ? `Eventos del ${chartData.start_date} al ${chartData.end_date}`
              : chartData.label
                ? `Eventos (${chartData.label})`
                : 'Eventos en el rango seleccionado'}
          </Typography>
        </Stack>

        {error && (
          <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
            {error.message}
          </Typography>
        )}

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Cargando…
            </Typography>
          </Box>
        )}

        {!loading && chartData.labels.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sin datos para mostrar en este rango.
          </Typography>
        ) : (
          <LineChart
            colors={colorPalette}
            xAxis={[
              {
                scaleType: 'point',
                data: chartData.labels,
                height: 30,
                valueFormatter: (v) => v,
              },
            ]}
            yAxis={[{ width: 50 }]}
            series={[
              {
                id: 'view_item',
                label: 'Productos vistos',
                showMark: false,
                curve: 'linear',
                stack: 'total',
                area: true,
                stackOrder: 'ascending',
                data: chartData.values.view_item,
              },
              {
                id: 'add_to_cart',
                label: 'Añadidos al carrito',
                showMark: false,
                curve: 'linear',
                stack: 'total',
                area: true,
                stackOrder: 'ascending',
                data: chartData.values.add_to_cart,
              },
              {
                id: 'purchase',
                label: 'Comprados',
                showMark: false,
                curve: 'linear',
                stack: 'total',
                area: true,
                stackOrder: 'ascending',
                data: chartData.values.purchase,
              },
            ]}
            height={270}
            margin={{ left: 0, right: 20, top: 15, bottom: 5 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiAreaElement-series-purchase': { fill: "url('#purchase')" },
              '& .MuiAreaElement-series-add_to_cart': { fill: "url('#add_to_cart')" },
              '& .MuiAreaElement-series-view_item': { fill: "url('#view_item')" },
              '& .MuiLineElement-root': { strokeWidth: 2 },
            }}
            hideLegend
          >
            <AreaGradient color={theme.palette.primary.dark} id="purchase" />
            <AreaGradient color={theme.palette.primary.main} id="add_to_cart" />
            <AreaGradient color={theme.palette.primary.light} id="view_item" />
          </LineChart>
        )}
      </CardContent>
    </Card>
  );
}