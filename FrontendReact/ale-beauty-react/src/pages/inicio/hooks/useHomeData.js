import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const useHomeData = (token, addAlert) => {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);

  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);

  const [carousel, setCarousel] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselError, setCarouselError] = useState(null);

  const firstHomeLoadRef = useRef(false);
  const fetchingCarouselRef = useRef(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadHomeData = useCallback(async () => {
    // Evitar poner loading otra vez si ya tenemos datos (opcional)
    if (!firstHomeLoadRef.current) {
      setHomeLoading(true);
    }
    setHomeError(null);
    try {
      const [inicioRes, novedadesRes, cartRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/inicio`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/v1/products/novedades`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/v1/cart`, { headers: authHeaders }),
      ]);

      const inicioData    = inicioRes.ok    ? await inicioRes.json()    : {};
      const novedadesData = novedadesRes.ok ? await novedadesRes.json() : [];
      const cartData      = cartRes.ok      ? await cartRes.json()      : {};

      setProducts(inicioData.products || []);
      setCategories(inicioData.categories || []);
      setNewProducts(Array.isArray(novedadesData) ? novedadesData : []);
      setCart(cartData.cart || null);

    } catch (err) {
      console.error('Error loading home data:', err);
      setHomeError(err);
      addAlert?.('Error al cargar los datos', 'error', 3500);
    } finally {
      setHomeLoading(false);
      firstHomeLoadRef.current = true;
    }
  }, [token, addAlert]);

  const loadCarousel = useCallback(async (force = false) => {
    if (fetchingCarouselRef.current) return;          // evitar doble carga simultánea
    if (!force && carousel.length > 0) return;        // ya cargado
    fetchingCarouselRef.current = true;

    setCarouselLoading(true);
    setCarouselError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/carousel`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Carousel ${res.status}`);
      const data = await res.json();

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
      fetchingCarouselRef.current = false;
    }
  }, [token]); // authHeaders depende de token; ok

  // Cargar al montar / cambio de token
  useEffect(() => {
    loadHomeData();
    loadCarousel(true); // fuerza primera carga del carrusel
  }, [loadHomeData, loadCarousel]);

  // Listener mejorado: si quieres reordenar sin refetch
  useEffect(() => {
    const reorderHandler = (e) => {
      // e.detail: nueva lista (opcional)
      if (Array.isArray(e.detail?.items)) {
        setCarousel(e.detail.items);
      } else {
        // Si realmente necesitas refetch
        loadCarousel(true);
      }
    };
    window.addEventListener('carousel:reordered', reorderHandler);
    return () => window.removeEventListener('carousel:reordered', reorderHandler);
  }, [loadCarousel]);

  // Si alguien sigue usando 'carousel:updated', lo rediriges al nuevo evento
  useEffect(() => {
    const legacyHandler = () => {
      loadCarousel(true);
    };
    window.addEventListener('carousel:updated', legacyHandler);
    return () => window.removeEventListener('carousel:updated', legacyHandler);
  }, [loadCarousel]);

  return {
    products,
    newProducts,
    categories,
    cart,
    setCart,
    homeLoading,
    homeError,
    carousel,
    carouselLoading,
    carouselError,
    reloadHomeData: loadHomeData,
    reloadCarousel: () => loadCarousel(true),
  };
};