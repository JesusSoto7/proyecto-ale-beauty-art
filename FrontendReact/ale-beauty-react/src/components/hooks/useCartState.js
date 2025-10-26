import { useState, useEffect, useCallback, useRef } from 'react';

export const useCartState = (token, t) => {
  const [cart, setCart] = useState([]);
  const [optimisticCount, setOptimisticCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Ref para evitar resetear optimisticCount prematuramente
  const isFetchingRef = useRef(false);

  const fetchCart = useCallback(() => {
    setLoading(true);
    setError(null);
    isFetchingRef.current = true; // ✅ Marcar que está cargando
    
    fetch("https://localhost:4000/api/v1/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => {
        setCart(data);
        // ✅ Solo resetear optimisticCount DESPUÉS de actualizar el cart
        setTimeout(() => {
          setOptimisticCount(0);
          isFetchingRef.current = false;
        }, 50); // Pequeño delay para que el número nuevo se vea primero
      })
      .catch((err) => {
        console.error("Error cargando cart: ", err);
        setError(t("cart.loadingError"));
        isFetchingRef.current = false;
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  // ✅ Eventos optimistas para el carrito
  useEffect(() => {
    fetchCart();
    
    const handleOptimisticUpdate = () => {
      if (!isFetchingRef.current) { // ✅ Solo incrementar si no está cargando
        setOptimisticCount(prev => prev + 1);
      }
    };

    const handleRealUpdate = () => {
      fetchCart();
      // ✅ NO resetear aquí, se hace en fetchCart después de actualizar
    };

    const handleUpdateFailed = () => {
      setOptimisticCount(prev => Math.max(0, prev - 1));
      isFetchingRef.current = false;
    };

    window.addEventListener("cartUpdatedOptimistic", handleOptimisticUpdate);
    window.addEventListener("cartUpdatedCustom", handleRealUpdate);
    window.addEventListener("cartUpdateFailed", handleUpdateFailed);
    
    return () => {
      window.removeEventListener("cartUpdatedOptimistic", handleOptimisticUpdate);
      window.removeEventListener("cartUpdatedCustom", handleRealUpdate);
      window.removeEventListener("cartUpdateFailed", handleUpdateFailed);
    };
  }, [fetchCart]);

  // ✅ Calcular total con optimistic updates
  const cartCount = Array.isArray(cart?.products)
    ? cart.products.reduce((acc, p) => acc + (p.cantidad || 1), 0) + optimisticCount
    : optimisticCount;

  return {
    cart,
    setCart,
    cartCount,
    loading,
    error,
    fetchCart
  };
};