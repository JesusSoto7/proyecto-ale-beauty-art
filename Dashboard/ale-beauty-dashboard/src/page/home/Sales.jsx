import { useRef } from 'react';
import {
  Box, Paper, Typography, CircularProgress,
  Alert, Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { useSalesData } from './hooks/useSalesData.js';
import { useExportActions } from './hooks/useExportActions.js';
import { SalesSummary } from '../../components/dashComponents/SalesSummary.jsx';
import { SalesFilters } from '../../components/dashComponents/SalesFilters.jsx';
import { SalesChart } from '../../components/dashComponents/SalesChart.jsx';
import { CategoryCards } from '../../components/dashComponents/CategoryCards.jsx';

export default function Sales() {
  const {
    metric, setMetric,
    level, setLevel,
    startDate, setStartDate,
    endDate, setEndDate,
    bounds,
    boundsLoading,
    dateNote,
    rows,
    summary,
    loading,
    error,
  } = useSalesData();

  const chartRef = useRef(null);

  const title =
    metric === 'revenue'
      ? (level === 'category' ? 'Ganancias por categoría' : 'Ganancias por subcategoría')
      : (level === 'category' ? 'Productos vendidos por categoría' : 'Productos vendidos por subcategoría');

  const { handlePNG, handlePDF, handleCSV } = useExportActions({
    metric,
    level,
    startDate,
    endDate,
    rows,
    summary,
  });

  const onExportPNG = () => handlePNG(chartRef);
  const onExportPDF = () => handlePDF(chartRef, title);
  const onExportCSV = () => handleCSV();

  const isAuthError = msg =>
    !!msg && (msg.includes('401') || msg.toLowerCase().includes('no autorizado') || msg.toLowerCase().includes('token'));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3} display="flex" flexDirection="column" gap={3}>
        <Typography variant="h4" fontWeight="bold">
          {level === 'category' ? 'Categorías' : 'Subcategorías'} · {metric === 'revenue' ? 'Ganancias' : 'Productos vendidos'}
        </Typography>

        <SalesSummary summary={summary} metric={metric} />

        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <SalesFilters
            metric={metric}
            setMetric={setMetric}
            level={level}
            setLevel={setLevel}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            bounds={bounds}
            boundsLoading={boundsLoading}
            dateNote={dateNote}
            loading={loading}
            rows={rows}
            onExportPNG={onExportPNG}
            onExportPDF={onExportPDF}
            onExportCSV={onExportCSV}
          />
        </Paper>

        <Paper sx={{ p: 2, minHeight: 380 }}>
          <Typography variant="h6" mb={2}>{title}</Typography>

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" height={260}>
              <CircularProgress />
            </Box>
          )}

          {error && !loading && (
            <Alert severity={isAuthError(error) ? 'warning' : 'error'}>
              {error}
            </Alert>
          )}

          {!loading && !error && rows.length === 0 && bounds.min && (
            <Box>No hay datos para el rango seleccionado.</Box>
          )}

          {!loading && !error && rows.length > 0 && (
            <>
              <SalesChart rows={rows} metric={metric} chartRef={chartRef} />
              <Divider sx={{ my: 2 }} />
              <CategoryCards rows={rows} metric={metric} />
            </>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}