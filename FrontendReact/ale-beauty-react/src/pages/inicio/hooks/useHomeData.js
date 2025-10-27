import { useState, useEffect, useCallback, useRef } from 'react';

export const useHomeData = (token, addAlert) => {
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Usar ref para evitar re-fetch cuando solo cambia el cart
  const hasLoadedRef = useRef(false);

  const loadHomeData = useCallback(async () => {
    // Si ya cargamos los datos, no recargar
    if (hasLoadedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const [inicioData, novedadesData, cartData] = await Promise.all([
        fetch('https://localhost:4000/api/v1/inicio').then(r => r.json()),
        fetch('https://localhost:4000/api/v1/products/novedades', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()),
        fetch('https://localhost:4000/api/v1/cart', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
      ]);

      setProducts(inicioData.products || []);
      setCategories(inicioData.categories || []);
      setNewProducts(novedadesData || []);
      setCart(cartData.cart);
      
      hasLoadedRef.current = true; // ✅ Marcar como cargado
      
      return {
        products: inicioData.products || [],
        newProducts: novedadesData || []
      };
    } catch (err) {
      console.error('Error loading home data:', err);
      setError(err);
      if (addAlert) {
        addAlert('Error al cargar los datos', 'error', 3500);
      }
      return { products: [], newProducts: [] };
    } finally {
      setLoading(false);
    }
  }, [token, addAlert]); // ✅ Removido la dependencia innecesaria

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
    reloadHomeData: loadHomeData
  };
};