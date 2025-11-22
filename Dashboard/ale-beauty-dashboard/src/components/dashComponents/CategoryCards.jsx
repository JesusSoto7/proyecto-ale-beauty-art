import { Box, Stack, Typography } from '@mui/material';
import { formatCurrencyFull, formatUnitsFull } from '../../page/home/utils/formatters.js';

export function CategoryCards({ rows, metric }) {
  if (!rows || rows.length === 0) return null;
  return (
    <Stack direction="row" gap={2} flexWrap="wrap" data-export-ignore>
      {rows.map(cat => (
        <Box
          key={cat.id}
          sx={{
            width: 180,
            p: 1.5,
            border: '1px solid #e5e7eb',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {cat.imagen_url && (
            <img
              src={cat.imagen_url}
              alt={cat.name}
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
            />
          )}
          <Typography variant="body2" fontWeight="bold" textAlign="center">
            {cat.name}
          </Typography>
          <Typography variant="caption">
            {metric === 'revenue'
              ? formatCurrencyFull(cat.value)
              : `${formatUnitsFull(cat.value)} uds`}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}