import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Copyright from '../../internals/components/Copyright';
import PageViewsBarChart from './PageViewsBarChart';
import ProductsChart from './ProductsChart';
import StatCard from './StatCard';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatCOP } from '../../services/currency';
import ChartProductsByCategory from './ChartProductsByCategory';
import { useTranslation } from "react-i18next";
import { apiGet } from '../../services/api';
import { Chip } from '@mui/material';

export default function MainGrid() {
  const [token, setToken] = React.useState(null);
  const [userCount, setUserCount] = React.useState(0);
  const [completedOrders, setCompletedOrders] = React.useState(0);

  const [userChartData, setUserChartData] = React.useState({ labels: [], values: [] });
  const [orderCharData, setOrderCharData] = React.useState({ labels: [], values: [] });
  const [totalSales, setTotalSales] = React.useState(0);
  const [totalSalesCharData, setTotalSalesCharData] = React.useState({ labels: [], values: [] });
  const [googlePageViewsData, setGooglePageViewsData] = React.useState({ labels: [], values: [] });

  // Skeleton loading states
  const [loadingSales, setLoadingSales] = React.useState(true);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [loadingPageViews, setLoadingPageViews] = React.useState(true);

  const { t } = useTranslation();

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  React.useEffect(() => {
    if (!token) return;
    setLoadingSales(true);

    apiGet('/api/v1/total_sales', token)
      .then((data) => setTotalSales(formatCOP(data?.total_sales ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/total_sales_per_day', token)
      .then((data) => {
        if (!data || !Object.keys(data).length) {
          setTotalSalesCharData({ labels: ["Sin datos"], values: [0] });
          setLoadingSales(false);
          return;
        }
        const processedData = Object.keys(data).map(dateStr => {
          const isoDate = new Date(`${dateStr}T00:00:00`);
          if (isNaN(isoDate)) return { label: "Fecha inválida", value: 0 };
          return {
            label: isoDate.toLocaleDateString("es-CO", {
              year: "numeric",
              month: "short",
              day: "numeric"
            }).replace(/\s*de\s*/gi, ' '),
            value: Number(data[dateStr] || 0),
          };
        });
        const sortedData = processedData.sort((a, b) => new Date(a.label) - new Date(b.label));
        setTotalSalesCharData({
          labels: sortedData.map(item => item.label),
          values: sortedData.map(item => item.value),
        });
      })
      .catch((error) => setTotalSalesCharData({ labels: ["Error"], values: [0] }))
      .finally(() => setLoadingSales(false));
  }, [token]);

  React.useEffect(() => {
    if (!token) return;
    setLoadingUser(true);

    apiGet('/api/v1/count', token)
      .then((data) => setUserCount(Number(data?.count ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/registrations_per_day', token)
      .then((data) => {
        if (!data || !Object.keys(data).length || data.message) {
          setUserChartData({ labels: ["Sin datos"], values: [0] });
          setLoadingUser(false);
          return;
        }
        const processedData = Object.keys(data).map(dateStr => {
          const isoDate = new Date(`${dateStr}T00:00:00`);
          if (isNaN(isoDate)) return { label: "Fecha inválida", value: 0 };
          return {
            label: isoDate.toLocaleDateString("es-CO", {
              year: "numeric",
              month: "short",
              day: "numeric"
            }).replace(/\s*de\s*/gi, ' '),
            value: Number(data[dateStr] || 0),
          };
        });
        const sortedData = processedData.sort((a, b) => new Date(a.label) - new Date(b.label));
        setUserChartData({
          labels: sortedData.map(item => item.label),
          values: sortedData.map(item => item.value),
        });
      })
      .catch((error) => setUserChartData({ labels: ["Error"], values: [0] }))
      .finally(() => setLoadingUser(false));
  }, [token]);

  React.useEffect(() => {
    if (!token) return;
    apiGet('/api/v1/completed_orders_count', token)
      .then((data) => setCompletedOrders(Number(data?.count ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/orders_completed_per_day', token)
      .then((data) => {
        const adjustedLabels = Object.keys(data || {}).map(dateStr => {
          const localDate = new Date(dateStr + "T00:00:00");
          return localDate.toLocaleDateString("es-CO", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "short",
            day: "numeric"
          }).replace(/\s*de\s*/gi, ' ');
        });

        const values = Object.values(data || {}).map(value => Number(value) || 0);
        setOrderCharData({ labels: adjustedLabels, values });
      })
      .catch(console.error);
  }, [token]);

  React.useEffect(() => {
    if (!token) return;
    setLoadingPageViews(true);

    apiGet('/api/v1/analytics/google_page_views', token)
      .then((data) => {
        const combinedData = (data.labels || []).map((label, index) => ({
          label: label.replace(/\s*de\s*/gi, ' '),
          value: data.values[index] || 0,
        }));

        const sortedData = combinedData.sort((a, b) => new Date(a.label) - new Date(b.label));
        const sortedLabels = sortedData.map((item) => item.label);
        const sortedValues = sortedData.map((item) => item.value);

        setGooglePageViewsData({
          labels: sortedLabels,
          values: sortedValues,
        });
      })
      .catch((err) => {
        console.error("google_page_views error:", err);
      })
      .finally(() => setLoadingPageViews(false));
  }, [token]);

  function computeTrendInfo(values) {
    if (!values || values.length < 2) {
      return { trend: 'neutral', percentText: 'Estable', deltaText: '+0' };
    }
    const last = Number(values[values.length - 1] || 0);
    const prev = Number(values[values.length - 2] || 0);

    if (prev === 0) {
      if (last === 0) {
        return { trend: 'neutral', percentText: 'Sin actividad', deltaText: '+0' };
      } else {
        // Si antes era 0 y ahora hay (por ejemplo, de 0 a 10), muestra +100%
        return { trend: 'up', percentText: '+100%', deltaText: `+${last}` };
      }
    }

    const percent = ((last - prev) / Math.abs(prev)) * 100;
    const delta = last - prev;
    const trend = percent > 2 ? 'up' : percent < -2 ? 'down' : 'neutral';
    const percentText = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
    const deltaText = `${delta >= 0 ? '+' : ''}${delta}`;
    return { trend, percentText, deltaText };
  }

  function computeUserChip(values) {
    const sum = (values || []).reduce((a, b) => a + b, 0);
    if (sum === 0) {
      return { percentText: "Sin registros", color: "default", trend: "neutral" };
    }
    const trendInfo = computeTrendInfo(values);
    if (trendInfo.percentText === "+0%" || trendInfo.percentText === "0%") {
      return { percentText: "Estable", color: "default", trend: "neutral" };
    }
    return { percentText: trendInfo.percentText, color: trendInfo.trend === "up" ? "success" : trendInfo.trend === "down" ? "error" : "default", trend: trendInfo.trend };
  }

  const userChip = computeUserChip(userChartData.values);
  const totalSalesTrend = computeTrendInfo(totalSalesCharData.values);
  const pageViewsTrend = computeTrendInfo(googlePageViewsData.values);

  const cards = [
    {
      title: 'Ganancias Totales',
      value: totalSales,
      interval: 'Últimos 30 días',
      trend: totalSalesTrend.trend,
      percentText: totalSalesTrend.percentText,
      deltaText: `${formatCOP(totalSalesTrend.deltaText)} esta semana`,
      subtitle: `${completedOrders} Ordenes`,
      data: totalSalesCharData.values || [],
      labels: totalSalesCharData.labels || [],
      hideArrow: true,
      isMoney: true, // <--- SOLO esta!
    },
    {
      title: 'Usuarios Registrados',
      value: userCount,
      interval: 'Últimos 30 días',
      trend: userChip.trend,
      data: userChartData.values || [],
      labels: userChartData.labels || [],
      subtitle: '',
      percentText: userChip.percentText,
      chipColor: userChip.color,
      deltaText: '',
      hideArrow: true,
      isMoney: false, // <--- NO formatea!
    },
    {
      title: 'Visitas a la página',
      value: googlePageViewsData.values.reduce((acc, curr) => acc + curr, 0),
      interval: 'Últimos 30 días',
      trend: pageViewsTrend.trend,
      percentText: pageViewsTrend.percentText,
      deltaText: `${pageViewsTrend.deltaText} vs prev`,
      subtitle: '',
      data: googlePageViewsData.values,
      labels: googlePageViewsData.labels,
      icon: VisibilityOutlinedIcon,
      hideArrow: true,
      isMoney: false,
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none', overflow: 'hidden', px: { xs: 9, md: 3 } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        Resumen
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} size={{ xs: 12, sm: 6, lg: 4 }} sm={6} lg={4}>
          <StatCard {...cards[0]} loading={loadingSales} />
        </Grid>
        <Grid item xs={12} size={{ xs: 12, sm: 6, lg: 4 }} sm={6} lg={4}>
          <StatCard {...cards[1]} loading={loadingUser} />
        </Grid>
        <Grid item xs={12} size={{ xs: 12, sm: 6, lg: 4 }} sm={6} lg={4}>
          <StatCard {...cards[2]} loading={loadingPageViews} />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 480 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Actividad y conversión de productos
            </Typography>
            <Box sx={{
              height: 400,
              maxWidth: '676px',
              minWidth: '676px',
              '@media (min-width: 1800px)': {
                maxWidth: '1000px',
                minWidth: '1000px',
              },
            }}>
              <ProductsChart />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 220, maxWidth: '500px' }}>
              <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
                Total vendidos por categoría
              </Typography>
              <Box sx={{ height: 410, width: '400px' }}>
                <ChartProductsByCategory />
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Copyright />
      </Box>
    </Box>
  );
}