import { Paper, Stack, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { formatCurrencyFull, formatUnitsFull } from '../../page/home/utils/formatters.js';

export function SalesSummary({ summary, metric }) {
  if (!summary) return null;
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Chip
          label={`Total: ${metric === 'revenue'
            ? formatCurrencyFull(summary.total)
            : `${formatUnitsFull(summary.total)} uds`
            }`}
          color={metric === 'revenue' ? 'secondary' : 'primary'}
        />
        <Chip
          label={`Rango: ${dayjs(summary.start).format('DD/MM/YYYY')} - ${dayjs(summary.end).format('DD/MM/YYYY')}`}
        />
      </Stack>
    </Paper>
  );
}