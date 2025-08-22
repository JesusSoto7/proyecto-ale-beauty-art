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
    <React.Fragment>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </React.Fragment>
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

export default function ChartProductsByCategory() {
  const [token, setToken] = React.useState(null)
  const [categoryData, setCategoryData] = React.useState([]);
  const [categoryPercent, setCategortPercent] = React.useState([]);

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
        )
      })
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Total vendidos por categoria
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
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
              secondaryText="Total" />
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
