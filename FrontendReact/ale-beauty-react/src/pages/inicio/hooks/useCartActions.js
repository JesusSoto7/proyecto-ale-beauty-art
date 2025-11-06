import { useCallback } from 'react';
import { addItem as addGuestItem } from '../../../utils/guestCart';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://localhost:4000';
const normalizeToken = (raw) => (raw && raw !== 'null' && raw !== 'undefined' ? raw : null);

export const useCartActions = (token, setCart, addAlert, t) => {
  // item puede ser un objeto producto o solo el id
  // catalog es el array de productos que se está renderizando (para resolver cuando llega un id)
  const addToCart = useCallback((item, catalog = []) => {
    const tok = normalizeToken(localStorage.getItem('token') || token);

    const product =
      typeof item === 'object'
        ? item
        : catalog.find((p) => String(p.id) === String(item));

    const productId = product?.id ?? item;

    // Invitado: usar guestCart y eventos del carrito
    if (!tok) {
      window.dispatchEvent(new CustomEvent('cartUpdatedOptimistic', { bubbles: false }));
      if (product) {
        // addGuestItem emite guestCartUpdated internamente
        addGuestItem(product, 1);
      }
      // Compatibilidad con listeners existentes
      window.dispatchEvent(new CustomEvent('cartUpdatedCustom', { bubbles: false }));
      addAlert(t?.('productDetails.addedToCart') || 'Se agregó al carrito', 'success', 3500);
      return;
    }

    // Autenticado: backend + eventos
    window.dispatchEvent(
      new CustomEvent('cartUpdatedOptimistic', {
        bubbles: false,
        detail: { productId, action: 'add' },
      })
    );

    fetch(`${API_BASE}/api/v1/cart/add_product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tok}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        try {
          return await res.json();
        } catch {
          return {};
        }
      })
      .then((data) => {
        const serverCart = data?.cart || data; // acepta ambos formatos
        if (serverCart?.products) {
          setCart?.(serverCart);
          window.dispatchEvent(new CustomEvent('cartUpdatedCustom', { bubbles: false }));
          addAlert('Se agregó al carrito', 'success', 3500);

          // GA opcional si está disponible
          if (window.gtag) {
            const p = serverCart.products.find((p) => String(p.product_id) === String(productId));
            if (p) {
              window.gtag('event', 'add_to_cart', {
                currency: 'COP',
                value: p.precio_producto,
                items: [
                  {
                    item_id: p.product_id,
                    item_name: p.nombre_producto,
                    price: p.precio_producto,
                    quantity: p.cantidad,
                  },
                ],
              });
            }
          }
        } else {
          // Si la API no trajo el carrito con products, igual forzar un refresh
          window.dispatchEvent(new CustomEvent('cartUpdatedCustom', { bubbles: false }));
        }
      })
      .catch(() => {
        addAlert(t?.('productDetails.cartAddError') || 'No se pudo agregar al carrito', 'error', 3500);
        window.dispatchEvent(
          new CustomEvent('cartUpdateFailed', {
            bubbles: false,
            detail: { productId, action: 'add' },
          })
        );
      });
  }, [token, setCart, addAlert, t]);

  return { addToCart };
};