import React from 'react';
import { Menu, MenuItem, Box, Typography } from '@mui/material';
import { BsPerson, BsBag, BsGeoAlt, BsBoxArrowRight } from 'react-icons/bs';

export default function UserMenu({ 
  anchorEl, 
  open, 
  onClose, 
  user, 
  onLogout, 
  navigate, 
  lang, 
  t, 
  pinkTheme 
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: '320px',
          padding: '10px 0',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${pinkTheme.light}`, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: pinkTheme.primary }}>
          {t("header.myAccount")}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t("header.personalSpace")}
        </Typography>
      </Box>
      
      <MenuItem 
        onClick={() => { navigate(`/${lang}/perfil`); onClose(); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsPerson style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.profile')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t("header.manageYourPersonalInformation")}
          </Typography>
        </Box>
      </MenuItem>
      
      <MenuItem 
        onClick={() => { navigate(`/${lang}/pedidos`); onClose(); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsBag style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.myOrders')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t("header.checkYourOrders")}
          </Typography>
        </Box>
      </MenuItem>
      
      <MenuItem 
        onClick={() => { navigate(`/${lang}/direcciones`); onClose(); }}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsGeoAlt style={{ marginRight: '12px', color: pinkTheme.primary, fontSize: '18px' }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>{t('header.myAddresses')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t("header.manageYourAddresses")}
          </Typography>
        </Box>
      </MenuItem>
      
      <Box sx={{ borderBottom: `1px solid ${pinkTheme.light}`, my: 1 }} />
      
      <MenuItem 
        onClick={onLogout}
        sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}
      >
        <BsBoxArrowRight style={{ marginRight: '12px', color: pinkTheme.dark, fontSize: '18px' }} />
        <Typography variant="body1" sx={{ fontWeight: 500, color: pinkTheme.dark }}>
          {t('header.logout')}
        </Typography>
      </MenuItem>
    </Menu>
  );
}