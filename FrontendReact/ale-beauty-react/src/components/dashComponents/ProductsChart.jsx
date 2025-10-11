import React, { useEffect, useState } from 'react';
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

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default function ProductsChart() {
  const [token, setToken] = React.useState(null);
  const theme = useTheme();
  const [chartData, setChartData] = React.useState({
    labels: [],
    values: { view_item: [], add_to_cart: [], purchase: [] }
  });

  React.useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no esta atenticado");
    }
  }, []);

  React.useEffect(() => {
    if (!token) return; // Solo ejecuta si hay token

    fetch('https://localhost:4000/api/v1/analytics/product_funnel_per_day', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setChartData(data));
  }, [token]);

  const colorPalette = [
    theme.palette.primary.light,     // view_item
    theme.palette.primary.main,      // add_to_cart
    theme.palette.primary.dark,      // purchase
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Embudo de productos
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {(chartData.values?.view_item || []).reduce((a, b) => a + b, 0)} vistos ·{' '}
              {(chartData.values?.add_to_cart || []).reduce((a, b) => a + b, 0)} al carrito ·{' '}
              {(chartData.values?.purchase || []).reduce((a, b) => a + b, 0)} comprados
            </Typography>
            {/* Puedes calcular el delta % si tienes datos previos, aquí solo ejemplo */}
            <Chip size="small" color="success" label="+35%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Total eventos de producto en los últimos 30 días
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: chartData.labels,
              height: 24,
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
              stackOrder: 'ascending',
              data: chartData.values.purchase,
              area: true,
            },
          ]}
          height={250}
          margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-purchase': {
              fill: "url('#purchase')",
            },
            '& .MuiAreaElement-series-add_to_cart': {
              fill: "url('#add_to_cart')",
            },
            '& .MuiAreaElement-series-view_item': {
              fill: "url('#view_item')",
            },
          }}
          hideLegend
        >
          <AreaGradient color={theme.palette.primary.dark} id="purchase" />
          <AreaGradient color={theme.palette.primary.main} id="add_to_cart" />
          <AreaGradient color={theme.palette.primary.light} id="view_item" />
        </LineChart>
      </CardContent>
    </Card>
  );
}