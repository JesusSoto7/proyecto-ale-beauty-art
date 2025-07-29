document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn-increase, .btn-decrease");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const productId = button.dataset.productId;
      const delta = button.classList.contains("btn-increase") ? 1 : -1;

      try {
        const response = await fetch("/cart/add", {
          method: "POST",
          headers: {
            "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            product_id: productId,
            cantidad: delta
          })
        });

        if (!response.ok) throw new Error("Error en la petición");
        const data = await response.json();

        // Actualizar campo de cantidad
        const input = document.querySelector(`input.quantity[data-product-id="${productId}"]`);
        if (input) input.value = data.cantidad;

        // Actualizar precio del producto
        const priceElement = document.querySelector(`#preci[data-product-id="${productId}"] strong`);
        if (priceElement) priceElement.textContent = formatCurrency(data.subtotal);

        // Actualizar subtotal en el resumen de compra
        const resumenSubtotal = document.querySelector(`.item-subtotal[data-product-id="${productId}"]`);
        if (resumenSubtotal) resumenSubtotal.textContent = formatCurrency(data.subtotal);

        // Actualizar cantidad en el resumen de compra
        const resumenCantidad = document.querySelector(`.item-cantidad[data-product-id="${productId}"]`);
        if (resumenCantidad) resumenCantidad.textContent = data.cantidad;

        // Actualizar total general
        const totalElement = document.getElementById("total-price");
        if (totalElement) totalElement.textContent = formatCurrency(data.total);

        // Actualizar contador del carrito en el header
        const cartCountElement = document.getElementById("count-cart");
        if (cartCountElement && data.total_items !== undefined) {
          cartCountElement.textContent = data.total_items;
        }

      } catch (error) {
        console.error("Error actualizando cantidad:", error);
      }
    });
  });
});

// ✅ Formato moneda COP
function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2
  }).format(value);
}
