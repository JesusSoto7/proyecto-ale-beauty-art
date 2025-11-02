import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}
AreaGradient.propTypes = { color: PropTypes.string.isRequired, id: PropTypes.string.isRequired };

export default function ProductsChart() {
  const theme = useTheme();
  const [token, setToken] = React.useState(null);
  const [chartData, setChartData] = React.useState({
    labels: [],
    values: { view_item: [], add_to_cart: [], purchase: [] },
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
    else setError(new Error('No autenticado. Inicia sesión para ver el embudo.'));
  }, []);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://localhost:4000/api/v1/analytics/product_funnel_per_day', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      try {
        data = contentType.includes('application/json') ? await res.json() : await res.text();
      } catch (_) {
        data = null;
      }
      if (!res.ok) {
        const message =
          typeof data === 'object' && data && (data.error || data.message)
            ? (data.error || data.message)
            : res.statusText || `Error ${res.status}`;
        throw Object.assign(new Error(message), { status: res.status });
      }

      const labels = Array.isArray(data?.labels) ? data.labels : [];
      const values = data?.values ?? {};
      setChartData({
        labels,
        values: {
          view_item: Array.isArray(values.view_item) ? values.view_item : [],
          add_to_cart: Array.isArray(values.add_to_cart) ? values.add_to_cart : [],
          purchase: Array.isArray(values.purchase) ? values.purchase : [],
        },
      });
    } catch (e) {
      setChartData({ labels: [], values: { view_item: [], add_to_cart: [], purchase: [] } });
      setError(e);
      if (e.status === 401) {
        const lang = location.pathname.split('/')[1] || 'es';
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        setTimeout(() => (window.location.href = `/${lang}/login`), 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { load(); }, [load]);

  const colorPalette = [theme.palette.primary.light, theme.palette.primary.main, theme.palette.primary.dark];

  if (error) {
    return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Typography component="h2" variant="subtitle2" gutterBottom>Embudo de productos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{error.message}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Typography component="h2" variant="subtitle2" gutterBottom>Embudo de productos</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Cargando…</Typography>
        </CardContent>
      </Card>
    );
  }

  const totalView = (chartData.values.view_item || []).reduce((a, b) => a + b, 0);
  const totalCart = (chartData.values.add_to_cart || []).reduce((a, b) => a + b, 0);
  const totalBuy  = (chartData.values.purchase || []).reduce((a, b) => a + b, 0);

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>Embudo de productos</Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ alignContent: { xs: 'center', sm: 'flex-start' }, alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" component="p">
              {totalView} vistos · {totalCart} al carrito · {totalBuy} comprados
            </Typography>
            <Chip size="small" color="success" label="+35%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total eventos de producto en los últimos 30 días
          </Typography>
        </Stack>

        {chartData.labels.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sin datos para mostrar.
          </Typography>
        ) : (
          <LineChart
            colors={colorPalette}
            xAxis={[{ scaleType: 'point', data: chartData.labels, height: 24 }]}
            yAxis={[{ width: 50 }]}
            series={[
              { id: 'view_item',    label: 'Productos vistos',      showMark: false, curve: 'linear', stack: 'total', area: true, stackOrder: 'ascending', data: chartData.values.view_item },
              { id: 'add_to_cart',  label: 'Añadidos al carrito',   showMark: false, curve: 'linear', stack: 'total', area: true, stackOrder: 'ascending', data: chartData.values.add_to_cart },
              { id: 'purchase',     label: 'Comprados',             showMark: false, curve: 'linear', stack: 'total', area: true, stackOrder: 'ascending', data: chartData.values.purchase },
            ]}
            height={250}
            margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
            grid={{ horizontal: true }}
            sx={{
              '& .MuiAreaElement-series-purchase':   { fill: "url('#purchase')" },
              '& .MuiAreaElement-series-add_to_cart':{ fill: "url('#add_to_cart')" },
              '& .MuiAreaElement-series-view_item':  { fill: "url('#view_item')" },
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