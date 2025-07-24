document.addEventListener("turbo:load", attachFavoriteHandlers);
document.addEventListener("DOMContentLoaded", attachFavoriteHandlers);

function attachFavoriteHandlers() {
  //modal de favoritos
  const openBtn = document.getElementById("open-favorites-modal");
  const modal = document.getElementById("favorites-modal");
  const closeBtn = document.getElementById("close-favorites-modal");
  const loaderOverlay = document.getElementById("favorites-loader-overlay");

  if (!openBtn || !modal || !closeBtn) return;

  openBtn.addEventListener("click", function () {
    mostrarLoader();
    modal.style.display = "block";
    updateFavoritesModal();
  });

  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  function mostrarLoader() {
    if (loaderOverlay) loaderOverlay.style.display = "flex";
  }

  function ocultarLoader() {
    if (loaderOverlay) loaderOverlay.style.display = "none";
  }

  function updateFavoritesModal() {
    fetch("/favorites/modal_favorites")
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const newContent = doc.querySelector("#favorite-products-container");
        const currentContainer = document.getElementById(
          "favorite-products-container"
        );

        if (newContent && currentContainer) {
          currentContainer.innerHTML = newContent.innerHTML;
        }
      })
      .catch((error) => {
        console.error("Error al cargar favoritos:", error);
      })
      .finally(() => {
        ocultarLoader();
      });
  }

  document.querySelectorAll(".favorite-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const productId = icon.dataset.productId;
      const isFavorited = icon.dataset.favorited === "true";
      const csrfToken = document.querySelector("[name='csrf-token']").content;

      icon.classList.remove("fa-solid", "fa-regular", "fa-xl", "fa-2xl");

      if (isFavorited) {
        icon.classList.add("fa-regular", "fa-2xl");
      } else {
        icon.classList.add("fa-solid", "fa-2xl");
      }

      icon.dataset.favorited = (!isFavorited).toString();

      mostrarLoader();

      fetch("/favorites", {
        method: isFavorited ? "DELETE" : "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error al actualizar favorito");
          updateFavoritesModal();
        })
        .catch((error) => {
          console.error("Error:", error);
          icon.classList.remove("fa-solid", "fa-regular", "fa-xl", "fa-2xl");

          if (isFavorited) {
            icon.classList.add("fa-solid", "fa-2xl");
          } else {
            icon.classList.add("fa-regular", "fa-2xl");
          }
        })
        .finally(() => {
          ocultarLoader();
        });
    });
  });
}
