import React from 'react';
import { Menu, Box, Typography, CircularProgress } from '@mui/material';
import { BsBell } from 'react-icons/bs';

export default function NotificationsMenu({ 
  anchorEl, 
  open, 
  onClose, 
  notificaciones, 
  loading, 
  formatTime, 
  pinkTheme 
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: 380,
          maxHeight: 480,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid #f0f0f0`,
        backgroundColor: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', fontSize: '16px' }}>
            Notificaciones
          </Typography>
          {notificaciones.length > 0 && (
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontSize: '12px' }}>
              {notificaciones.length} {notificaciones.length === 1 ? 'notificación' : 'notificaciones'}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: pinkTheme.primary }} size={24} />
          </Box>
        ) : notificaciones.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <BsBell size={28} style={{ color: '#ccc', marginBottom: 12 }} />
            <Typography variant="body2" sx={{ color: '#999', fontSize: '14px' }}>
              No tienes notificaciones
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 1 }}>
            {notificaciones.map((notificacion) => (
              <Box
                key={notificacion.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 8,
                  backgroundColor: 'white',
                  border: `1px solid #f0f0f0`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    borderColor: pinkTheme.secondary
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: pinkTheme.light,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <BsBell size={14} style={{ color: pinkTheme.primary }} />
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#333',
                        lineHeight: 1.3,
                        mb: 0.5,
                        fontSize: '13px'
                      }}
                    >
                      {notificacion.notification_message?.title || 'Nueva notificación'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        lineHeight: 1.4,
                        mb: 1,
                        fontSize: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {notificacion.notification_message?.message || 'Sin descripción'}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ color: '#999', fontSize: '11px' }}
                    >
                      {formatTime(notificacion.notification_message?.created_at || notificacion.created_at)}
                    </Typography>
                  </Box>
                  
                  {!notificacion.read && (
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: pinkTheme.primary,
                        flexShrink: 0,
                        mt: 0.5
                      }} 
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {notificaciones.length > 0 && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid #f0f0f0`,
          backgroundColor: '#fafafa'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: pinkTheme.primary, 
              fontWeight: 500,
              textAlign: 'center',
              display: 'block',
              cursor: 'pointer',
              fontSize: '13px',
              '&:hover': { color: pinkTheme.dark }
            }}
            onClick={onClose}
          >
            Ver todas las notificaciones
          </Typography>
        </Box>
      )}
    </Menu>
  );
}