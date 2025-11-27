import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { TbCategory2 } from "react-icons/tb";
import { BiSolidDiscount } from "react-icons/bi";
import { TfiReceipt } from "react-icons/tfi";
import { BiSupport } from "react-icons/bi";


export default function MenuContent() {
  const navigate = useNavigate();

  const mainListItems = [
    { text: 'Home', icon: <HomeRoundedIcon />, path: `/home` },
    { text: 'Productos', icon: <AnalyticsRoundedIcon />, path: `/home/products` },
    { text: 'Ventas', icon: <AnalyticsRoundedIcon />, path: `/home/ventas` },
    { text: 'Categorias', icon: <TbCategory2 />, path: `/home/categories` },
    { text: 'Carousel', icon: <AssignmentRoundedIcon />, path: `/home/carousel` },
    { text: 'Usuarios', icon: <PeopleRoundedIcon />, path: `/home/usuarios` },
    { text: 'Ordenes', icon: <TfiReceipt />, path: `/home/orders` },
    { text: 'Notificaciones', icon: <CircleNotificationsIcon />, path: `/home/notificaciones` },
    { text: 'Ver Mensajes', icon: <BiSupport />, path: `/home/support-messages` },

  ];

  const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon /> },
  ];

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* --- Acordeón de Descuentos --- */}
        <Accordion
          disableGutters
          sx={{
            mt: 0.5,
            bgcolor: 'background.paper',
            boxShadow: 'none',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
            sx={{
              minHeight: 20,
              '& .MuiAccordionSummary-content': {
                margin: 0,
                alignItems: 'center',
              },
              '& .MuiAccordionSummary-expandIconWrapper': {
                color: 'text.secondary',
              },
              pl: 1,
              pr: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 35 }}>
              <BiSolidDiscount size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Descuentos"
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List disablePadding dense>
              <ListItemButton
                sx={{ pl: 6, py: 0.3 }}
                onClick={() => navigate(`/home/crear_descuento`)}
              >
                <ListItemText primary="Crear Descuento" primaryTypographyProps={{ fontSize: 13 }} />
              </ListItemButton>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* --- Fin acordeón --- */}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
