import { Outlet } from "react-router-dom";
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './AppNavbar';
import SideMenu from './SideMenu';
import AppTheme from '../../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../../theme/customizations';
import Header from "./Header";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function DashboardLayout(props) {
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        minHeight: '100vh',
        overflow: 'hidden' // Prevenir scroll horizontal
      }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            width: 0, // Forzar que tome solo el espacio disponible
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >

          <Stack
            spacing={2}
            sx={{
              alignItems: 'stretch', // Cambiar de 'center' a 'stretch'
              mx: 2, // Reducir margen horizontal
              pb: 5,
              mt: { xs: 8, md: 0 },
              width: '100%',
              maxWidth: 'none',
            }}
          >
            <Header/>
            {/* Aquí se renderizan las rutas hijas */}
            <Outlet />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
