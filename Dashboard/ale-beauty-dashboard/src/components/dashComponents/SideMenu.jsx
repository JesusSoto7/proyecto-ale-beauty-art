import * as React from 'react';
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { ListItemButton } from '@mui/material';


const drawerWidth = 296;


const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://localhost:4000/api/v1/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem('token');
    try {
      await fetch('https://localhost:4000/api/v1/sign_out', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Error cerrando sesión:', err);
    }
    localStorage.removeItem('token');
    window.location.href = `/${lang || 'es'}/login`; // ✅ Redirección con idioma por defecto
  }

  if (!user) return null;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
{/*         <Avatar
          sizes="small"
          alt={`${user.nombre?.charAt(0).toUpperCase()}`}
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36, backgroundColor: "#f896b8" }}
        /> */}

        <ListItemButton   sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
          onClick={handleLogout}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText >Logout</ListItemText>

        </ListItemButton>

{/*         <Box sx={{ mr: 'auto' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {user.email}
          </Typography>
        </Box> */}
   {/*      <OptionsMenu /> */}
      </Stack>
    </Drawer>
  );
}
