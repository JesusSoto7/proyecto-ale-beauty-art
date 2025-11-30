import * as React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';

// ...StyledText and PieCenterLabel remain the same

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
      },
    },
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

const colors = [
  'hsla(243, 79%, 89%, 1.00)',
  'hsla(243, 24%, 71%, 1.00)',
  'hsla(247, 17%, 48%, 0.87)',
  'hsla(249, 32%, 43%, 0.91)',
];

// --- SKELETON COMPONENT BELOW --- //
function DonutChartSkeleton({ rows = 2 }) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
      <CardContent>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 260,
          py: 2,
        }}>

          <Skeleton variant="circular" width={190} height={190} sx={{ mx: 'auto' }} />
          {/* Puedes poner solo un Typography si quieres texto de carga */}
          {/* <Typography variant="h5" sx={{ mx: 'auto' }}>Cargando gráfica...</Typography> */}
        </Box>
        {/* Skeleton para barras, títulos e imágenes */}
        {Array.from({ length: rows }).map((_, idx) => (
          <Stack key={idx} direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="text" width={70} />
                <Skeleton variant="text" width={44} />
              </Stack>
              <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, width: '100%' }} />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}

// --- MAIN CHART COMPONENT --- //
export default function ChartProductsByCategory() {
  const [token, setToken] = React.useState(null);
  const [categoryData, setCategoryData] = React.useState([]);
  const [categoryPercent, setCategortPercent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

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
    setLoading(true);
    fetch("https://localhost:4000/api/v1/total_sales_by_category", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const total = data.reduce((sum, cat) => sum + cat.total_sales, 0);

        setCategoryData(
          data.map((cat) => ({
            id: cat.id,
            label: cat.name,
            value: cat.total_sales,
          }))
        );

        setCategortPercent(
          data.map((cat) => ({
            id: cat.id,
            nombre_categoria: cat.name,
            value: total > 0 ? ((cat.total_sales / total) * 100).toFixed(1) : 0,
            imagen_url: cat.imagen_url,
          }))
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  // --- Muestra Skeleton mientras loading, PieChart con info después ---
  if (loading) {
    return <DonutChartSkeleton rows={2} />;
  }

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[
              {
                data: categoryData,
                innerRadius: 75,
                outerRadius: 100,
                paddingAngle: 0,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel
              primaryText={categoryData.reduce(
                (sum, cat) => sum + cat.value,
                0
              ).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })}
              secondaryText="Total"
            />
          </PieChart>
        </Box>
        {categoryPercent.map((cat, index) => (
          <Stack
            key={index}
            direction="row"
            sx={{ alignItems: 'center', gap: 2, pb: 2 }}
          >
            {cat.imagen_url ? (
              <img
                src={cat.imagen_url}
                alt={cat.nombre_categoria}
                width={32}
                height={32}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "grey.300",
                  borderRadius: "50%",
                }}
              />
            )}

            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                  {cat.nombre_categoria}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {cat.value}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                aria-label="Number of users by country"
                value={cat.value}
                sx={{
                  [`& .${linearProgressClasses.bar}`]: {
                    backgroundColor: colors[index % colors.length],
                  },
                }}
              />
            </Stack>
          </Stack>
        ))}
      </CardContent>
    </Card>
  );
}