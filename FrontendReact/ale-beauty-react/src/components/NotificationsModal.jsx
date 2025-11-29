import React, { useState } from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import { Pagination } from '@mui/material';
import { BsBell } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

export default function NotificationsModal({
    open,
    onClose,
    notificaciones,
    formatTime,
    pinkTheme
}) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const rowsPerPage = 6;

    // Calcular paginación
    const indexOfLastRow = page * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentNotifications = notificaciones.slice(indexOfFirstRow, indexOfLastRow);
    const count = Math.ceil(notificaciones.length / rowsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog
                size="lg"
                sx={{
                    width: { xs: '90vw', sm: 500 },
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    borderRadius: 'md',
                    p: 3,
                    boxShadow: 'lg',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <ModalClose />
                <Typography level="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {t('notifications.allNotifications', 'Todas las notificaciones')}
                </Typography>

                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, mb: 2 }}>
                    {notificaciones.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <BsBell size={32} style={{ color: '#ccc', marginBottom: 12 }} />
                            <Typography level="body-md" sx={{ color: 'neutral.500' }}>
                                {t('notifications.empty', 'No tienes notificaciones')}
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {currentNotifications.map((notificacion) => (
                                <Box
                                    key={notificacion.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 'md',
                                        bgcolor: 'background.surface',
                                        border: '1px solid',
                                        borderColor: 'neutral.outlinedBorder',
                                        display: 'flex',
                                        gap: 2,
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            bgcolor: 'background.level1'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: pinkTheme.light,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            color: pinkTheme.primary
                                        }}
                                    >
                                        <BsBell size={18} />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                                                {notificacion.notification_message?.title || 'Nueva notificación'}
                                            </Typography>
                                            {!notificacion.read && (
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: pinkTheme.primary
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
                                            {notificacion.notification_message?.message || 'Sin descripción'}
                                        </Typography>

                                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                                            {formatTime(notificacion.notification_message?.created_at || notificacion.created_at)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                {notificaciones.length > rowsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Pagination
                            count={count}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="small"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    '&.Mui-selected': {
                                        backgroundColor: pinkTheme.primary,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: pinkTheme.dark,
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </ModalDialog>
        </Modal>
    );
}
