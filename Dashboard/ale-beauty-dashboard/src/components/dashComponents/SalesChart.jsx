import { Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  formatCurrencyFull,
  formatUnitsFull,
  formatAxisValue,
  getNiceNumber,
} from '../../page/home/utils/formatters.js';

// Paleta de colores cíclica
const PALETTE = [
  '#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02',
  '#a6761d', '#666666', '#1f78b4', '#b2df8a', '#fb9a99', '#fdbf6f',
];

const MIN_INSIDE_PIXELS = 28;

export function SalesChart({ rows, metric, chartRef }) {
  if (!rows || rows.length === 0) return null;

  // Limpia valores numéricos (si vienen formateados como "540.000" o "540,000")
  const parseVal = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const cleaned = String(v)
      .replace(/\s+/g, '')
      .replace(/[.,](?=\d{3}\b)/g, '')
      .replace(/,/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  };

  const xData = rows.map((r) => r.name);
  const yData = rows.map((r) => parseVal(r.value));
  const maxValue = yData.length ? Math.max(...yData) : 0;

  // Eje Y: si rango pequeño (<=10) ticks discretos; si no, niceMax
  const SMALL_RANGE_THRESHOLD = 10;
  const isSmallRange = maxValue <= SMALL_RANGE_THRESHOLD;

  let yAxis;
  if (isSmallRange) {
    const tickValues = Array.from({ length: maxValue + 1 }, (_, i) => i);
    yAxis = [{
      min: 0,
      max: maxValue,
      tickValues,
      width: 80,
      valueFormatter: (v) =>
        metric === 'revenue' ? formatAxisValue(v) : formatUnitsFull(v),
    }];
  } else {
    const niceMax = getNiceNumber(maxValue);
    yAxis = [{
      min: 0,
      max: niceMax,
      tickMinStep: niceMax / 5,
      width: 80,
      valueFormatter: (v) =>
        metric === 'revenue' ? formatAxisValue(v) : formatUnitsFull(v),
    }];
  }

  // Formateo completo para tooltip y etiquetas internas
  const formatDisplay = (v) =>
    metric === 'revenue'
      ? formatCurrencyFull(v)
      : `${formatUnitsFull(v)} uds`;

  // (Opcional) porcentaje respecto al total; descomenta si lo quieres dentro.
  // const total = yData.reduce((a,b)=>a+b,0);
  // const formatDisplay = (v) => {
  //   const pct = total ? (v / total) * 100 : 0;
  //   return metric === 'revenue'
  //     ? `${formatCurrencyFull(v)} (${pct.toFixed(1)}%)`
  //     : `${formatUnitsFull(v)} uds (${pct.toFixed(1)}%)`;
  // };

  // Slot de barra que añade color y label dentro
  const ColoredLabeledBar = (barProps) => {
    const {
      x, y, width, height, dataIndex,
      // handlers necesarios para tooltip
      onPointerEnter, onPointerMove, onPointerLeave,
      onMouseEnter, onMouseMove, onMouseLeave,
      onFocus, onBlur,
      role, tabIndex,
    } = barProps;

    const val = yData[dataIndex];
    const fill = PALETTE[dataIndex % PALETTE.length];
    const labelText = formatDisplay(val);

    const drawInside = height >= MIN_INSIDE_PIXELS;
    const textX = x + width / 2;
    const textY = drawInside ? y + height / 2 : y - 6;
    const textColor = drawInside ? '#fff' : '#444';

    return (
      <>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={2}
          ry={2}
          onPointerEnter={onPointerEnter}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
          role={role}
          tabIndex={tabIndex}
        />
        {val > 0 && (
          <text
            x={textX}
            y={textY}
            fill={textColor}
            fontSize={11}
            fontWeight={600}
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
            style={{
              paintOrder: 'stroke',
              stroke: drawInside ? 'rgba(0,0,0,0.25)' : 'transparent',
              strokeWidth: drawInside ? 0.5 : 0,
            }}
          >
            {labelText}
          </text>
        )}
      </>
    );
  };

  return (
    <Box ref={chartRef}>
      <BarChart
        height={400}
        margin={{
          left: isSmallRange ? 70 : 90, // aumentar margen izquierdo para que el eje no recorte
          right: 24,
          top: 24,
          bottom: 40,
        }}
        xAxis={[{ data: xData, scaleType: 'band' }]}
        yAxis={yAxis}
        series={[{
          data: yData,
          label: metric === 'revenue' ? 'Ganancias (COP)' : 'Productos (uds)',
        }]}
        tooltip={{
          trigger: 'item',
          valueFormatter: (v) => formatDisplay(v),
        }}
        slots={{
          bar: ColoredLabeledBar,
        }}
      />
    </Box>
  );
}