document.addEventListener("DOMContentLoaded", () => {

  //modal de favoritos

  const openBtn = document.getElementById("open-favorites-modal");
  const modal = document.getElementById("favorites-modal");
  const closeBtn = document.getElementById("close-favorites-modal");

  openBtn.addEventListener("click", function() {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function(event) {
    if(event.target === modal){
      modal.style.display = "none";
    }
  });

  function updateFavoritesModal() {
    fetch("/favorites/modal_favorites")
      .then(response => response.text())
      .then(html => {
        const container = document.querySelector("#favorites-modal .custom-modal-content");
        if (container) container.innerHTML = html;
      })
      .catch(error => console.error("Error al cargar favoritos:", error));
  }

  document.querySelectorAll(".favorite-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const productId = icon.dataset.productId;
      const isFavorited = icon.dataset.favorited === "true";
      const csrfToken = document.querySelector("[name='csrf-token']").content;

      if (isFavorited) {
        // Quitar de favoritos
        fetch("/favorites", {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ product_id: productId })
        })
        .then(response => {
          if (!response.ok) throw new Error("Error al eliminar favorito");
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
          icon.dataset.favorited = "false";
           updateFavoritesModal();
        })
        .catch(error => console.error(error));
      } else {
        // Agregar a favoritos
        fetch(`/favorites`, {
          method: "POST",
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ product_id: productId })
        })
        .then(response => {
          if (!response.ok) throw new Error("Error al agregar favorito");
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
          icon.dataset.favorited = "true";
                   
          updateFavoritesModal();
        })
        .catch(error => console.error(error));
      }
    });
  });
});