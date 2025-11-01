import React from "react";
import { Link, useParams } from "react-router-dom";
import { Box, Typography, Button, Container } from '@mui/material';
import { Block, Home } from '@mui/icons-material';
import { useTranslation } from "react-i18next";

export default function Forbidden403() {
    const { lang } = useParams();
    const { t } = useTranslation();
    
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                    py: 4
                }}
            >
                <Block sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
                
                <Typography variant="h1" component="h1" color="error" fontWeight="bold" gutterBottom>
                    403
                </Typography>
                
                <Typography variant="h4" component="h2" gutterBottom>
                    Acceso Denegado
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                    No tienes permisos de administrador para acceder al panel de administración.
                    Solo los administradores pueden acceder a esta área.
                </Typography>
                
                <Button
                    component={Link}
                    to={`/${lang}/login`}
                    variant="contained"
                    startIcon={<Home />}
                    size="large"
                    sx={{
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                        }
                    }}
                >
                    Volver al Login
                </Button>
            </Box>
        </Container>
    );
}