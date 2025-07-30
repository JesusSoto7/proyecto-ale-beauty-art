document.addEventListener("DOMContentLoaded", () => {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach(button => {
    button.addEventListener("click", async (e) => {
      e.preventDefault();

      const productId = button.dataset.productId;

      const cartCountElement = document.getElementById("count-cart");
      if (cartCountElement) {
        const current = parseInt(cartCountElement.textContent) || 0;
        cartCountElement.textContent = current + 1;
      }

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
            cantidad: 1
          })
        });

        if (!response.ok) throw new Error("Error en la petición");
        const data = await response.json();

        // Ajustar contador
        if (cartCountElement && data.total_items !== undefined) {
          cartCountElement.textContent = data.total_items;
        }

      } catch (error) {
        console.error("Error añadiendo producto:", error);

        // En caso de error, revertir incremento optimista
        if (cartCountElement) {
          const current = parseInt(cartCountElement.textContent) || 0;
          cartCountElement.textContent = Math.max(0, current - 1);
        }
      }
    });
  });
});