import { Stack, FormControl, FormLabel, ToggleButtonGroup, ToggleButton, Alert, Tooltip, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export function SalesFilters({
  metric, setMetric,
  level, setLevel,
  startDate, setStartDate,
  endDate, setEndDate,
  bounds,
  boundsLoading,
  dateNote,
  loading,
  rows,
  onExportPNG,
  onExportPDF,
  onExportCSV,
}) {
  const handleStart = v => {
    if (!v) return;
    if (bounds.min && v.isBefore(bounds.min)) return setStartDate(bounds.min);
    if (bounds.max && v.isAfter(bounds.max)) return setStartDate(bounds.max);
    setStartDate(v);
  };
  const handleEnd = v => {
    if (!v) return;
    if (bounds.min && v.isBefore(bounds.min)) return setEndDate(bounds.min);
    if (bounds.max && v.isAfter(bounds.max)) return setEndDate(bounds.max);
    setEndDate(v);
  };

  return (
    <>
      {boundsLoading && <Alert severity="info">Cargando límites de fechas…</Alert>}
      {!boundsLoading && !bounds.min && (
        <Alert severity="info">Aún no hay compras registradas.</Alert>
      )}
      {dateNote && <Alert severity="info">{dateNote}</Alert>}

      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
        <DatePicker
          label="Inicio"
          value={startDate}
          onChange={handleStart}
          minDate={bounds.min || undefined}
          maxDate={bounds.max || dayjs().endOf('day')}
          disableFuture
        />
        <DatePicker
          label="Fin"
          value={endDate}
          onChange={handleEnd}
          minDate={bounds.min || undefined}
          maxDate={bounds.max || dayjs().endOf('day')}
          disableFuture
        />
      </Stack>

      <Stack direction="row" spacing={3} flexWrap="wrap" alignItems="center" sx={{ mt: 2 }}>
        <FormControl>
          <FormLabel>Métrica</FormLabel>
          <ToggleButtonGroup
            value={metric}
            exclusive
            onChange={(_e, v) => v && setMetric(v)}
            size="small"
          >
            <ToggleButton value="products">Productos vendidos</ToggleButton>
            <ToggleButton value="revenue">Ganancias ($)</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <FormControl>
          <FormLabel>Nivel</FormLabel>
          <ToggleButtonGroup
            value={level}
            exclusive
            onChange={(_e, v) => v && setLevel(v)}
            size="small"
          >
            <ToggleButton value="category">Categoría</ToggleButton>
            <ToggleButton value="subcategory">Subcategoría</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Descargar imagen PNG del gráfico">
            <span>
              <Button
                variant="outlined"
                size="small"
                disabled={rows.length === 0 || loading}
                onClick={onExportPNG}
              >
                PNG
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Generar PDF con gráfico y tabla">
            <span>
              <Button
                variant="contained"
                size="small"
                disabled={rows.length === 0 || loading}
                onClick={onExportPDF}
              >
                PDF
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Descargar datos como CSV">
            <span>
              <Button
                variant="outlined"
                size="small"
                disabled={rows.length === 0 || loading}
                onClick={onExportCSV}
              >
                CSV
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
}