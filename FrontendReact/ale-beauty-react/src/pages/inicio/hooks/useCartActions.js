import { useCallback } from 'react';

export const useCartActions = (token, setCart, addAlert, t) => {
  const addToCart = useCallback((productId) => {
    // ✅ OPTIMISTIC UPDATE - Actualizar contador INMEDIATAMENTE
    window.dispatchEvent(new CustomEvent("cartUpdatedOptimistic", { 
      bubbles: false,
      detail: { productId, action: 'add' }
    }));
    
    // ✅ Mostrar alerta inmediatamente
    addAlert("Se agregó al carrito", "success", 3500);

    // Hacer la petición al servidor en background
    fetch("https://localhost:4000/api/v1/cart/add_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          // ✅ Actualizar con datos reales del servidor
          setCart(data.cart);
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));

          const product = data.cart.products.find(p => p.product_id === productId);
          if (window.gtag && product) {
            window.gtag("event", "add_to_cart", {
              currency: "COP",
              value: product.precio_producto,
              items: [
                {
                  item_id: product.product_id,
                  item_name: product.nombre_producto,
                  price: product.precio_producto,
                  quantity: product.cantidad,
                },
              ],
            });
            console.log("🛒 Evento GA4 enviado: add_to_cart", product);
          }
        } else if (data.errors) {
          // ✅ Si falla, revertir y mostrar error
          addAlert(t('productDetails.error') + data.errors.join(", "), "error", 3500);
          window.dispatchEvent(new CustomEvent("cartUpdateFailed", { 
            bubbles: false,
            detail: { productId, action: 'add' }
          }));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        addAlert(t('productDetails.cartAddError'), "error", 3500);
        
        // ✅ Revertir cambio optimista
        window.dispatchEvent(new CustomEvent("cartUpdateFailed", { 
          bubbles: false,
          detail: { productId, action: 'add' }
        }));
      });
  }, [token, setCart, addAlert, t]);

  return { addToCart };
};