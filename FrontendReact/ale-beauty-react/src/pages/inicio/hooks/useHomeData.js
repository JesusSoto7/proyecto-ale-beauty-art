import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:4000';

export const useHomeData = (token, addAlert) => {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrusel
  const [carousel, setCarousel] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselError, setCarouselError] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inicioRes, novedadesRes, cartRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/inicio`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/v1/products/novedades`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/v1/cart`, { headers: authHeaders }),
      ]);

      const inicioData = inicioRes.ok ? await inicioRes.json() : {};
      const novedadesData = novedadesRes.ok ? await novedadesRes.json() : [];
      const cartData = cartRes.ok ? await cartRes.json() : {};

      setProducts(inicioData.products || []);
      setCategories(inicioData.categories || []);
      setNewProducts(Array.isArray(novedadesData) ? novedadesData : []);
      setCart(cartData.cart || null);

    } catch (err) {
      console.error('Error loading home data:', err);
      setError(err);
      addAlert?.('Error al cargar los datos', 'error', 3500);
    } finally {
      setLoading(false);
    }
  }, [token, addAlert]);

  const loadCarousel = useCallback(async () => {
    setCarouselLoading(true);
    setCarouselError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/carousel`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Carousel ${res.status}`);
      const data = await res.json();

      // Normalizar (por si algún backend antiguo devuelve solo strings):
      const normalized = Array.isArray(data)
        ? data.map(d => (typeof d === 'string'
            ? { id: crypto.randomUUID(), url: d }
            : { id: d.id, url: d.url }))
        : [];

      setCarousel(normalized);
    } catch (err) {
      console.error('Error loading carousel:', err);
      setCarouselError(err);
    } finally {
      setCarouselLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHomeData();
    loadCarousel();
  }, [loadHomeData, loadCarousel]);

  useEffect(() => {
    const handler = () => {
      loadCarousel();
    };
    window.addEventListener('carousel:updated', handler);
    return () => window.removeEventListener('carousel:updated', handler);
  }, [loadCarousel]);

  return {
    products,
    newProducts,
    categories,
    cart,
    setCart,
    loading,
    error,
    carousel,
    carouselLoading,
    carouselError,
    reloadHomeData: loadHomeData,
    reloadCarousel: loadCarousel,
  };
};