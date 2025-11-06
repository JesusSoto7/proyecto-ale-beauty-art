import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:4000';
const normalizeToken = (raw) => (raw && raw !== 'null' && raw !== 'undefined' ? raw : null);

export const useHomeData = (token, showAlert) => {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tok = normalizeToken(localStorage.getItem('token') || token);

      // Público: inicio
      const inicioPromise = fetch(`${API_BASE}/api/v1/inicio`).then(async (r) => {
        if (!r.ok) throw new Error('Error cargando inicio');
        return r.json();
      });

      // Novedades: si hay token, mándalo; si no, pídelo sin Authorization
      const novedadesPromise = fetch(`${API_BASE}/api/v1/products/novedades`, {
        headers: tok ? { Authorization: `Bearer ${tok}` } : undefined,
      }).then(async (r) => {
        if (!r.ok) {
          // Si este endpoint exige auth y no hay token, tolera vacío
          if (r.status === 401) return [];
          throw new Error('Error cargando novedades');
        }
        return r.json();
      });

      const [inicioData, novedadesData] = await Promise.all([inicioPromise, novedadesPromise]);

      setProducts(inicioData.products || []);
      setCategories(inicioData.categories || []);
      setNewProducts(Array.isArray(novedadesData) ? novedadesData : []);

      // Carrito: SOLO si hay token válido
      if (tok) {
        try {
          const cartRes = await fetch(`${API_BASE}/api/v1/cart`, {
            headers: { Authorization: `Bearer ${tok}` },
          });
          if (cartRes.ok) {
            const cartJson = await cartRes.json();
            setCart(cartJson.cart || cartJson);
          } else {
            // No hagas ruido por 401 aquí en home
            setCart(null);
          }
        } catch {
          setCart(null);
        }
      } else {
        setCart(null);
      }

      return {
        products: inicioData.products || [],
        newProducts: Array.isArray(novedadesData) ? novedadesData : [],
      };
    } catch (err) {
      console.error('Error loading home data:', err);
      setError(err);
      if (showAlert) showAlert('Error al cargar los datos', 'error', 3500);
      return { products: [], newProducts: [] };
    } finally {
      setLoading(false);
    }
  }, [token, showAlert]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  return {
    products,
    newProducts,
    categories,
    cart,
    setCart,
    loading,
    error,
    reloadHomeData: loadHomeData,
  };
};