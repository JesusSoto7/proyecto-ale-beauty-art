import * as React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import logo from '../../assets/images/logo8.jpeg';

const pinkTheme = {
  primary: '#e91e63',
  secondary: '#f8bbd0',
  dark: '#ad1457',
  light: '#fce4ec',
  background: '#fff5f7'
};
const textColor = '#1f2937';
export default function SelectContent() {
  const [company, setCompany] = React.useState('');

  const handleChange = (event) => {
    setCompany(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 0.5,
      }}
    >

      <Avatar
        src={logo}
        alt="Logo Ale Beauty Art"
        imgProps={{
          loading: 'lazy',
          style: { objectFit: 'cover' }
        }}
        sx={{
          width: { xs: 56, sm: 64, md: 64 },   // Tamaño responsivo
          height: { xs: 56, sm: 64, md: 65 },
          border: '3px solid #2727271b',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.61)',
          backgroundColor: '#373753ff',
        }}
        onError={(e) => {
          e.currentTarget.src =
            'https://via.placeholder.com/150?text=Logo'; // fallback
        }}
      />

      {/* Si prefieres <img>, descomenta esto y quita el Avatar arriba:
      <img
        src={logo}
        alt="Logo Ale Beauty Art"
        loading="lazy"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid #e91e63',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          backgroundColor: '#fff'
        }}
        onError={(e) => {
          e.currentTarget.src =
            'https://via.placeholder.com/150?text=Logo';
        }}
      />
      */}

      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.5rem' },
          letterSpacing: '0.6px',
          background: 'linear-gradient(90deg,#e91e63,#ad1457)',
          WebkitBackgroundClip: 'text',
          color: textColor,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'transform .25s, filter .25s',
          '&:hover': {
            transform: 'translateY(-2px)',
            filter: 'brightness(1.1)'
          }
        }}
      >
        Ale Beauty Art
      </Typography>
    </Box>
  );
}