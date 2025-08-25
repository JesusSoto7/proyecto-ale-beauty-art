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
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import { formatCOP } from '../../services/currency';
import ChartProductsByCategory from './ChartProductsByCategory';
import { useTranslation } from "react-i18next";



export default function MainGrid() {
  const [token, setToken] = React.useState(null);
  const [userCount, setUserCount] = React.useState(0);
  const [userChartData, setUserChartData] = React.useState([]);
  const [completedOrders, setCompletedOrders] = React.useState(0);
  const [orderCharData, setOrderCharData] = React.useState([]);
  const [totalSales, setTotalSales] = React.useState(0);
  const [totalSalesCharData, setTotalSalesCharData] = React.useState([]);
  const { t } = useTranslation();

  React.useEffect(() => {

    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no esta atenticado");
    }
  }, []);

  React.useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/total_sales", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const total = formatCOP(data.total_sales);
        setTotalSales(total);
      })
      .catch((err) => console.error(err));

    fetch("https://localhost:4000/api/v1/total_sales_per_day", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const values = Object.values(data).map(v => Number(v));
        setTotalSalesCharData(values);
      })
  }, [token]);

  React.useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/completed_orders_count", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setCompletedOrders(data.count);
      })
      .catch((err) => console.error(err));

    fetch("https://localhost:4000/api/v1/orders_completed_per_day", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const values = Object.values(data).map(v => Number(v));
        setOrderCharData(values);
      })
      .catch((err) => console.error(err))
  }, [token])

  React.useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/count", {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserCount(data.count);
      })
      .catch((err) => console.error(err));

    fetch("https://localhost:4000/api/v1/registrations_per_day", {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const values = Object.values(data).map(v => Number(v));
        setUserChartData(values);
      })
      .catch((err) => console.error(err));

  }, [token]);


  const data = [
    {
      title: 'Usuarios',
      value: userCount,
      interval: 'Ultimos 30 dias',
      trend: 'up',
      data: userChartData,
    },
    {
      title: 'Compras',
      value: completedOrders,
      interval: 'Ultimos 30 dias',
      trend: 'down',
      data: orderCharData,
    },
    {
      title: 'Total vendidos',
      value: totalSales,
      interval: 'Ultimos 30 dias',
      trend: 'neutral',
      data: totalSalesCharData,
    },
  ];



  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t("overview")}
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        {t("details")}
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
            <CustomizedTreeView />
            <ChartProductsByCategory />
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
