import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import logo from '../assets/images/ale_logo.jpg';
import { Link, useParams } from 'react-router-dom';

function CheckoutHeader() {
  const { lang } = useParams();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#fff0f6', // fondo rosa suave
          borderBottom: '2px solid #f8bbd0',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 70, md: 90 },
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 4, md: 8 },
          }}
        >
          {/* Título */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: '#d63384', // rosa fuerte
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
            }}
          >
            Verificar
          </Typography>

          {/* Logo */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="logo"
            sx={{
              p: 0,
              '& img': {
                height: { xs: 35, sm: 45, md: 55 },
                borderRadius: '50%',
                border: '2px solid #ffd8e5ff',
                transition: '0.3s',
              },
              '& img:hover': {
                boxShadow: '0 0 10px #f48fb1',
                transform: 'scale(1.05)',
              },
            }}
          >
            <Link to={`/${lang || 'es'}/inicio`}>
              <img src={logo} alt="Logo Tienda de Belleza" />
            </Link>
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default CheckoutHeader;
