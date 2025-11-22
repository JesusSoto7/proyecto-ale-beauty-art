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

export default function MainGrid() {
  const [token, setToken] = React.useState(null);
  const [userCount, setUserCount] = React.useState(0);
  const [completedOrders, setCompletedOrders] = React.useState(0);
  const [userChartData, setUserChartData] = React.useState({ labels: [], values: [] });
  const [orderCharData, setOrderCharData] = React.useState({ labels: [], values: [] });
  const [totalSales, setTotalSales] = React.useState(0);
  const [totalSalesCharData, setTotalSalesCharData] = React.useState({ labels: [], values: [] });

  // estados nuevos para vistas
  const [totalPageViews, setTotalPageViews] = React.useState(0);
  const [pageViewsCharData, setPageViewsCharData] = React.useState({ labels: [], values: [] });

  const { t } = useTranslation();

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  React.useEffect(() => {
    if (!token) return;

    apiGet('/api/v1/total_sales', token)
      .then((data) => setTotalSales(formatCOP(data?.total_sales ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/total_sales_per_day', token)
      .then((data) => {
        const labels = Object.keys(data || {}).map(dateStr => {
          const bogotaDate = new Date(
            new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Bogota" })
          );
          return bogotaDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });
        const values = Object.values(data || {}).map((v) => Number(v) || 0);
        setTotalSalesCharData({ labels, values });
      })
      .catch(console.error);
  }, [token]);

  React.useEffect(() => {
    if (!token) return;

    apiGet('/api/v1/completed_orders_count', token)
      .then((data) => setCompletedOrders(Number(data?.count ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/orders_completed_per_day', token)
      .then((data) => {
        const labels = Object.keys(data || {}).map(dateStr => {
          const bogotaDate = new Date(
            new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Bogota" })
          );
          return bogotaDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });
        const values = Object.values(data || {}).map((v) => Number(v) || 0);
        setOrderCharData({ labels, values });
      })
      .catch(console.error);
  }, [token]);

  React.useEffect(() => {
    if (!token) return;

    apiGet('/api/v1/count', token)
      .then((data) => setUserCount(Number(data?.count ?? 0)))
      .catch(console.error);

    apiGet('/api/v1/registrations_per_day', token)
      .then((data) => {
        const labels = Object.keys(data || {}).map(dateStr => {
          const bogotaDate = new Date(
            new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Bogota" })
          );
          return bogotaDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });
        const values = Object.values(data || {}).map((v) => Number(v) || 0);
        setUserChartData({ labels, values });
      })
      .catch(console.error);
  }, [token]);

  // NUEVO: obtener datos de vistas desde backend (analytics controller)
  React.useEffect(() => {
    if (!token) return;

    apiGet('/api/v1/analytics/total_page_views', token)
      .then((data) => setTotalPageViews(data?.total_page_views ?? 0))
      .catch((err) => {
        console.error("total_page_views error:", err);
        console.error("body:", err.body);
      });


    apiGet('/api/v1/analytics/page_views_per_day', token)
      .then((data) => {
        const labels = Object.keys(data || {}).map(dateStr => {
          const bogotaDate = new Date(
            new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Bogota" })
          );
          return bogotaDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });
        const values = Object.values(data || {}).map((v) => Number(v) || 0);
        setPageViewsCharData({ labels, values });
      })
      .catch((err) => {
        console.error("page_views_per_day error:", err);
        console.error("body:", err.body);
      });
  }, [token]);

  // compute a simple trend & delta from last two data points
  function computeTrendInfo(values) {
    if (!values || values.length < 2) {
      return { trend: 'neutral', percentText: '+0%', deltaText: '+0' };
    }
    const last = Number(values[values.length - 1] || 0);
    const prev = Number(values[values.length - 2] || 0);

    // avoid division by zero
    const percent = prev === 0 ? (last === 0 ? 0 : 100) : ((last - prev) / Math.abs(prev)) * 100;
    const delta = last - prev;

    const trend = percent > 2 ? 'up' : percent < -2 ? 'down' : 'neutral';
    const percentText = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
    const deltaText = delta >= 1000 || delta <= -1000
      ? `${delta >= 0 ? '+' : ''}${(delta / 1000).toFixed(1)}k`
      : `${delta >= 0 ? '+' : ''}${delta}`;

    return { trend, percentText, deltaText };
  }

  const totalSalesTrend = computeTrendInfo(totalSalesCharData.values);
  const pageViewsTrend = computeTrendInfo(pageViewsCharData.values);

  const cards = [
    {
      title: 'Total vendido',
      value: totalSales,
      interval: 'Últimos 30 días',
      trend: totalSalesTrend.trend,
      percentText: totalSalesTrend.percentText,
      deltaText: `${totalSalesTrend.deltaText} this week`,
      subtitle: `${completedOrders} Orders`,
      data: totalSalesCharData.values || [],
      labels: totalSalesCharData.labels || [],
    },
    {
      title: 'Usuarios Registrados',
      value: userCount,
      interval: 'Últimos 30 días',
      trend: 'up',
      data: userChartData.values || [],
      labels: userChartData.labels || [],
      subtitle: '',
      percentText: '+0%',
      deltaText: '',
    },
    {
      title: 'Visitas a la página',
      value: totalPageViews,
      interval: 'Últimos 30 días',
      trend: pageViewsTrend.trend,
      percentText: pageViewsTrend.percentText,
      deltaText: `${pageViewsTrend.deltaText} vs prev`,
      subtitle: '',
      data: pageViewsCharData.values || [],
      labels: pageViewsCharData.labels || [],
      icon: VisibilityOutlinedIcon,
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none', overflow: 'hidden', px: { xs: 1, md: 3 } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        {t("overview")}
      </Typography>

      {/* Top stat cards row - 3 cards, larger */}
      {/* Top stat cards row - 3 cards, larger */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}

      </Grid>

      {/* Big charts row: ProductsChart (wide) + right column with PageViewsBarChart and Category chart stacked */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 480 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Embudo de productos
            </Typography>
            <Box sx={{ height: 400, maxWidt: '1000px', minWidth: '1000px' }}>
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

      {/* Footer spacing and copyright */}
      <Box sx={{ mt: 4 }}>
        <Copyright />
      </Box>
    </Box>
  );
}