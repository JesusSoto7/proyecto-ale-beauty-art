import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Button
} from '@mui/material';
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from "@mui/icons-material/Favorite";
import { useTranslation } from "react-i18next";
import { formatCOP } from '../services/currency';
import '../assets/stylesheets/ProductosCliente.css';

// Estilos para el tema rosa
const pinkTheme = {
  primary: '#e91e63',
  secondary: '#f8bbd0',
  dark: '#ad1457',
  light: '#fce4ec'
};

export default function CategoryProducts() {
  const { lang, categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { t, i18n } = useTranslation();
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Obtener token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);
  
  useEffect(() => {
    if (!token) return;
    fetchCategoryProducts();
    loadFavorites();
  }, [token, categoryId]);

  async function fetchCategoryProducts() {
    try {
      setLoading(true);
      setError(null);
      
      const categoryRes = await fetch(`https://localhost:4000/api/v1/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
      }

      const subCategoryRes = await fetch(`https://localhost:4000/api/v1/categories/${categoryId}/sub_categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (subCategoryRes.ok) {
        const subCategoryData = await subCategoryRes.json();
        setSubCategories(Array.isArray(subCategoryData) ? subCategoryData : []);
      }

      // const productsRes = await fetch(`https://localhost:4000/api/v1/categories/${categoryId}/products`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      // if (productsRes.ok) {
      //   const productsData = await productsRes.json();
      //   setProducts(Array.isArray(productsData) ? productsData : []);
      // } else {
      //   throw new Error(t("categoryProducts.errorLoad"));
      // }
    } catch (error) {
      console.error('Error fetching category products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const loadFavorites = async () => {
    try {
      const res = await fetch('https://localhost:4000/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const ids = data.map(fav => fav.product_id || fav.id);
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Error cargando favoritos:', err);
    }
  };

  const addToCart = (productId) => {
    fetch('https://localhost:4000/api/v1/cart/add_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) {
          alert(t("categoryProducts.addedToCart"));
        } else if (data.errors) {
          console.warn('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto al carrito: ', err);
      });
  };

  const toggleFavorite = async (productId) => {
    if (favoriteIds.includes(productId)) {
      try {
        const res = await fetch(`https://localhost:4000/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setFavoriteIds(prev => prev.filter(id => id !== productId));
        }
      } catch (err) {
        console.error("Error quitando favorito:", err);
      }
    } else {
      try {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          setFavoriteIds(prev => [...prev, productId]);
        }
      } catch (err) {
        console.error("Error añadiendo favorito:", err);
      }
    }
  };

  if (!token) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">{t("categoryProducts.notAuth")}</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: pinkTheme.primary }} />
          <Typography variant="h6" sx={{ mt: 2, color: pinkTheme.primary }}>
            {t("categoryProducts.loading")}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
          <Button 
            sx={{ ml: 2, color: pinkTheme.primary, '&:hover': { backgroundColor: pinkTheme.light } }} 
            onClick={fetchCategoryProducts}
          >
            {t("categoryProducts.retry")}
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 'bold', color: pinkTheme.primary, fontSize: { xs: '2rem', md: '2.5rem' }, textAlign: 'center', mb: 4 }}
        >
          {category?.nombre_categoria || category?.name || t("categoryProducts.defaultCategory")}
        </Typography>
      </Box>

      {/* 🔹 NUEVO: Mensaje si no hay subcategorías */}
      {subCategories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, backgroundColor: pinkTheme.light, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" color={pinkTheme.dark}>
            No hay subcategorías disponibles
          </Typography>
          <Typography variant="body1" color={pinkTheme.dark}>
            Pronto añadiremos más subcategorías en esta categoría.
          </Typography>
        </Box>
      )}

    </Container>
  );
}
