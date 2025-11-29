import { useState, useEffect, useCallback, useRef } from 'react';
import { getGuestCart } from '../../utils/guestCart';

const normalizeToken = (raw) => (raw && raw !== 'null' && raw !== 'undefined' ? raw : null);

const mapGuestToCart = () => {
  const guest = getGuestCart();
  const items = guest?.items || [];
  return {
    id: null,
    products: items.map(i => ({
      product_id: i.id,
      nombre_producto: i.name,
      precio_producto: Number(i.price || 0),
      precio_con_mejor_descuento: Number(i.price || 0),
      cantidad: Number(i.quantity || 1),
      imagen_url: i.image || null,
      stock: Number(i.stock || 1),
    })),
  };
};

export const useCartState = (token, t) => {
  const [cart, setCart] = useState({ products: [] });
  const [optimisticCount, setOptimisticCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);

  const fetchCart = useCallback(() => {
    const tok = normalizeToken(localStorage.getItem('token') || token);

    // Invitado: no golpees el backend
    if (!tok) {
      setLoading(true);
      setError(null);
      isFetchingRef.current = true;
      setCart(mapGuestToCart());
      setOptimisticCount(0);
      isFetchingRef.current = false;
      setLoading(false);
      return;
    }

    // Autenticado
    setLoading(true);
    setError(null);
    isFetchingRef.current = true;

    fetch("https://localhost:4000/api/v1/cart", {
      headers: { Authorization: `Bearer ${tok}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        const text = await res.text();
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
      })
      .then((data) => {
        if (data) setCart(data?.cart || data);
        setTimeout(() => {
          setOptimisticCount(0);
          isFetchingRef.current = false;
        }, 50);
      })
      .catch((err) => {
        console.error("Error cargando cart: ", err);
        setError(t?.("cart.loadingError") || "No se pudo cargar el carrito");
        isFetchingRef.current = false;
      })
      .finally(() => setLoading(false));
  }, [token, t]);

  useEffect(() => {
    const interval = setInterval(fetchCart, 15000); // cada 15 segundos
    return () => clearInterval(interval);
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();

    const handleOptimisticUpdate = () => {
      if (!isFetchingRef.current) setOptimisticCount(prev => prev + 1);
    };

    const handleRealUpdate = () => {
      fetchCart();
    };

    const handleUpdateFailed = () => {
      setOptimisticCount(prev => Math.max(0, prev - 1));
      isFetchingRef.current = false;
    };

    const handleGuestUpdated = () => {
      const tok = normalizeToken(localStorage.getItem('token') || token);
      if (!tok) setCart(mapGuestToCart());
    };

    window.addEventListener("cartUpdatedOptimistic", handleOptimisticUpdate);
    window.addEventListener("cartUpdatedCustom", handleRealUpdate);
    window.addEventListener("cartUpdateFailed", handleUpdateFailed);
    window.addEventListener("guestCartUpdated", handleGuestUpdated);

    return () => {
      window.removeEventListener("cartUpdatedOptimistic", handleOptimisticUpdate);
      window.removeEventListener("cartUpdatedCustom", handleRealUpdate);
      window.removeEventListener("cartUpdateFailed", handleUpdateFailed);
      window.removeEventListener("guestCartUpdated", handleGuestUpdated);
    };
  }, [fetchCart, token]);

  const baseCount = Array.isArray(cart?.products)
    ? cart.products.reduce((acc, p) => acc + (Number(p.cantidad) || 1), 0)
    : 0;

  const cartCount = baseCount + optimisticCount;

  return {
    cart,
    setCart,
    cartCount,
    loading,
    error,
    fetchCart
  };
};