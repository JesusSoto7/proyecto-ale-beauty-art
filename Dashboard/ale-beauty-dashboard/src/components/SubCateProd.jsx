import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SubCateProd() {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" component="h2">
        Productos por Subcategoría
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Funcionalidad en desarrollo para el panel de administración.
      </Typography>
    </Box>
  );
}