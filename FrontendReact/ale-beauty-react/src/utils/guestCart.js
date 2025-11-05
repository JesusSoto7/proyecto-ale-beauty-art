const KEY = "guestCart";

export function getGuestCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function save(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  // Notifica a todos los listeners de guest
  window.dispatchEvent(new CustomEvent("guestCartUpdated", { detail: cart }));
  // Compatibilidad con otros listeners que refrescan a partir de este evento
  window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
}

export function addItem(product, quantity = 1) {
  const cart = getGuestCart();
  const id = product?.id ?? product?.product_id ?? product;
  const name = product?.nombre_producto ?? product?.name ?? "";
  const price = Number(
    product?.precio_con_mejor_descuento ??
      product?.precio_producto ??
      product?.price ??
      0
  );
  const image = product?.imagen_url ?? product?.image ?? null;

  const found = cart.items.find((i) => i.id === id);
  if (found) {
    found.quantity += quantity;
  } else {
    cart.items.push({ id, name, price, image, quantity });
  }
  save(cart);
  return cart;
}

export function updateQty(productId, quantity) {
  const cart = getGuestCart();
  cart.items = cart.items.map((i) =>
    i.id === productId ? { ...i, quantity: Math.max(1, Number(quantity || 1)) } : i
  );
  save(cart);
  return cart;
}

export function removeItem(productId) {
  const cart = getGuestCart();
  cart.items = cart.items.filter((i) => i.id !== productId);
  save(cart);
  return cart;
}

export function clearCart() {
  try {
    // Borra la key para evitar estados “fantasma”
    localStorage.removeItem(KEY);
  } catch {
    // Fallback si algo falla
    localStorage.setItem(KEY, JSON.stringify({ items: [] }));
  }
  // Notifica a todos
  window.dispatchEvent(new CustomEvent("guestCartUpdated", { detail: { items: [] } }));
  window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
}