import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import logo from '../assets/images/ale_logo.jpg';
import { Link, useParams } from 'react-router-dom';
import { colorSchemes } from '../shared-theme/themePrimitives';


function CheckoutHeader() {
  const { lang } = useParams();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar variant="dense" sx={{ minHeight: 90, height: 40 }}>

          <Typography variant="h4" color="inherit" component="div" sx={{ mr: 90 }}>
            Checkout
          </Typography>

          <IconButton edge="start" color="inherit" aria-label="logo">
            <div className="logo">
              <Link to={`/${lang || 'es'}/inicio`}>
                <img src={logo} alt="Logo Tienda de Belleza" />
              </Link>

            </div>
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default CheckoutHeader;
