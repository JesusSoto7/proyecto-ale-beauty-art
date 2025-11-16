import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../../internals/components/Copyright';
import CustomizedTreeView from './CustomizedTreeView';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import PageViewsBarChart from './PageViewsBarChart';
import ProductsChart from './ProductsChart';
import StatCard from './StatCard';
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

  const data = [
    {
      title: 'Usuarios Registrados',
      value: userCount,
      interval: 'Ultimos 30 dias',
      trend: 'up',
      data: userChartData.values || [],
      labels: userChartData.labels || [],
    },
    {
      title: 'Compras',
      value: completedOrders,
      interval: 'Ultimos 30 dias',
      trend: 'down',
      data: orderCharData.values || [],
      labels: orderCharData.labels || [],
    },
    {
      title: 'Total vendido',
      value: totalSales,
      interval: 'Ultimos 30 dias',
      trend: 'neutral',
      data: totalSalesCharData.values || [],
      labels: totalSalesCharData.labels || [],
    },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 'none', overflow: 'hidden' }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t("overview")}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2), width: '100%', margin: 0 }}>
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
    
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t("details")}
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ width: '100%', margin: 0 }}>
{/*         <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid> */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <ChartProductsByCategory />
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}