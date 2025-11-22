import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses, lineElementClasses } from '@mui/x-charts/LineChart';
import { chartsAxisHighlightClasses } from '@mui/x-charts/ChartsAxisHighlight';

/**
 * SimpleVisitorsCard (SparkLineChart)
 * - data: array de números (visitas)
 * - labels: array de strings (fechas correspondientes)
 * - barColor: color principal para la línea/área
 *
 * Comportamiento:
 * - mueve el highlight con el mouse (onHighlightedAxisChange)
 * - solo el padre muestra la fecha/valor (evitamos duplicados)
 */
export default function SimpleVisitorsCard({
  title = 'Visitors',
  value = 0,
  interval = 'Últimos 30 días',
  avgTime = '',
  data = [],
  labels = [],
  trend = 'neutral',
  percentText = '+0.0%',
  deltaText = '+0',
  barColor = 'rgb(21,101,192)', // azul por defecto
}) {
  const theme = useTheme();

  // SparkLineChart highlighted index
  const [highlightIndex, setHighlightIndex] = React.useState(null);

  // Ajusta arrays: SparkLineChart espera data array y xAxis data labels
  const chartData = Array.isArray(data) ? data : [];
  const chartLabels = Array.isArray(labels) ? labels : chartData.map((_, i) => String(i));

  // settings tomados/adaptados del ejemplo de MUI
  const settings = {
    data: chartData,
    baseline: 'min',
    margin: { bottom: 0, top: 6, left: 4, right: 0 },
    xAxis: { id: 'axis-x', data: chartLabels },
    yAxis: {
      domainLimit: (_, maxValue) => ({
        min: -maxValue / 8,
        max: maxValue,
      }),
    },
    sx: {
      // area y line styling
      [`& .${areaElementClasses.root}`]: { opacity: 0.16, fill: barColor },
      [`& .${lineElementClasses.root}`]: { strokeWidth: 2, stroke: barColor },
      [`& .${chartsAxisHighlightClasses.root}`]: {
        stroke: barColor,
        strokeDasharray: 'none',
        strokeWidth: 2,
      },
    },
    slotProps: {
      lineHighlight: { r: 4 },
    },
    clipAreaOffset: { top: 2, bottom: 2 },
    axisHighlight: { x: 'line' },
    // ajusta padding para que se vea parecido al ejemplo
  };

  // obtener el valor resaltado actual (o último si null)
  const highlightedValue =
    highlightIndex === null ? chartData[chartData.length - 1] : chartData[highlightIndex];
  const highlightedLabel =
    highlightIndex === null ? chartLabels[chartLabels.length - 1] : chartLabels[highlightIndex];

  // formateadores
  const compactFormatter = React.useMemo(
    () => new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }),
    []
  );
  const formattedValue = typeof value === 'number' ? compactFormatter.format(value) : value;

  const trendColor =
    trend === 'up' ? theme.palette.success.main : trend === 'down' ? theme.palette.error.main : theme.palette.text.secondary;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: (t) => `1px solid ${t.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        bgcolor: (t) => (t.palette.mode === 'light' ? '#fff' : '#0f1113'),
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: (t) => (t.palette.mode === 'light' ? '#f4f6f8' : t.palette.grey[900]),
                borderRadius: 2,
              }}
            >
              <PersonOutlineIcon fontSize="small" />
            </Avatar>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: (t) => (t.palette.mode === 'light' ? t.palette.text.primary : '#fff') }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {avgTime ? `Avg. time: ${avgTime}` : interval}
              </Typography>
            </Box>
          </Stack>

          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
        </Stack>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            color: (t) => (t.palette.mode === 'light' ? t.palette.text.primary : '#fff'),
            letterSpacing: '-0.5px',
          }}
        >
          {formattedValue}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ borderBottom: `solid 2px ${barColor}22` }}>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 600, pl: 0.5 }}>
              {(highlightedValue ?? 0).toLocaleString()}
            </Typography>

            <SparkLineChart
              height={44}
              width={200}
              area
              showHighlight
              color={barColor}
              onHighlightedAxisChange={(axisItems = []) => {
                // axisItems: [{ axisId, dataIndex }, ...]
                const item = axisItems[0];
                if (item && typeof item.dataIndex === 'number') {
                  setHighlightIndex(item.dataIndex);
                } else {
                  setHighlightIndex(null);
                }
              }}
              highlightedAxis={
                highlightIndex === null ? [] : [{ axisId: 'axis-x', dataIndex: highlightIndex }]
              }
              {...settings}
            />
          </Stack>
        </Box>

        {/* fecha/valor mostrado ÚNICAMENTE por este componente (no duplicación) */}
        <Box sx={{ mb: 1, minHeight: 22 }}>
          {highlightedLabel ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {highlightedLabel} — {highlightedValue ?? 0} visitas
            </Typography>
          ) : null}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <ShowChartIcon sx={{ fontSize: 18, color: trendColor }} />
            {trend === 'up' ? (
              <ArrowUpwardIcon fontSize="small" sx={{ color: trendColor }} />
            ) : trend === 'down' ? (
              <ArrowDownwardIcon fontSize="small" sx={{ color: trendColor }} />
            ) : (
              <Box sx={{ width: 18 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 700, color: (t) => (t.palette.mode === 'light' ? t.palette.text.primary : '#fff') }}>
              {percentText}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {deltaText}
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ color: 'primary.main' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

SimpleVisitorsCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  interval: PropTypes.string,
  avgTime: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.number),
  labels: PropTypes.arrayOf(PropTypes.string),
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  percentText: PropTypes.string,
  deltaText: PropTypes.string,
  barColor: PropTypes.string,
};
