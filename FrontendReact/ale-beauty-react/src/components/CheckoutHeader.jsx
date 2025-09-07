import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import logo from '../assets/images/ale_logo.jpg';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function CheckoutHeader() {
  const { lang } = useParams();
  const { t } = useTranslation();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          color: '#000',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.21)', // sombra suave abajo
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
          {/* Título internacionalizado */}
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: '#000', 
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
            }}
          >
            {t('checkout.title')}
          </Typography>

          {/* Logo */}
          <IconButton
            edge="end"
            aria-label="logo"
            sx={{
              p: 0,
              '& img': {
                height: { xs: 35, sm: 45, md: 55 },
                borderRadius: '50%',
                border: '2px solid #e0e0e0',
                transition: '0.3s',
              },
              '& img:hover': {
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
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
