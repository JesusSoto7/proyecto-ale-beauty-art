document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".predeterminada-checkbox").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      if (!this.checked) return;

      const addressId = this.dataset.addressId;

      document.querySelectorAll(".predeterminada-checkbox").forEach(cb => {
        cb.checked = cb.dataset.addressId === addressId;
      });

      fetch(`/shipping_addresses/${addressId}/set_predeterminada`, {
        method: "PATCH",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ from_checkout: false })
      })
      .catch(() => {
        alert("Error al cambiar dirección predeterminada.");
      });
    });
  });
});
