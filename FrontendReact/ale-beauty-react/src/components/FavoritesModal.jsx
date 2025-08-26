// src/components/FavoritesModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import Skeleton from "@mui/joy/Skeleton";
// Importa tu archivo CSS donde definas la animación.
// Por ejemplo: import './favorites-modal.css';

export default function FavoritesModal({ open, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false); // Estado para la animación de borrado masivo

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (open) {
      fetchFavorites();
    }
  }, [open]);

  const addToCart = (productId) => {
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
          alert("Producto añadido al carrito");
        } else if (data.errors) {
          alert("Error: " + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error("Error añadiendo producto al carrito: ", err);
        alert("Error añadiendo producto al carrito");
      });
  };

  const addAllToCart = () => {
    if (favorites.length === 0) {
      alert("No tienes productos en favoritos.");
      return;
    }

    Promise.all(
      favorites.map((product) =>
        fetch("https://localhost:4000/api/v1/cart/add_product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: product.id }),
        }).then((res) => res.json())
      )
    )
      .then((results) => {
        const errors = results.filter((r) => r.errors);
        if (errors.length > 0) {
          alert("Algunos productos no se pudieron añadir.");
        } else {
          alert("Todos los productos fueron añadidos al carrito ✅");
        }
      })
      .catch((err) => {
        console.error("Error añadiendo todos al carrito: ", err);
        alert("Error añadiendo todos los productos al carrito");
      });
  };

  async function fetchFavorites() {
    setLoading(true);
    try {
      const res = await fetch("https://localhost:4000/api/v1/favorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Asegura que cada producto tenga la propiedad 'isRemoving'
        setFavorites(data.map(p => ({ ...p, isRemoving: false })));
      }
    } catch (err) {
      console.error("Error cargando favoritos", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id) {
    try {
      const productToRemove = favorites.find((p) => p.id === id);
      if (!productToRemove) return;

      // Inicia la animación de borrado
      setFavorites((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isRemoving: true } : p))
      );

      // Espera a que la animación termine (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await fetch(`https://localhost:4000/api/v1/favorites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
      } else {
        // Si la eliminación falla, revierte la animación
        setFavorites((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isRemoving: false } : p))
        );
      }
    } catch (err) {
      console.error("Error eliminando favorito", err);
    }
  }

  const clearFavorites = async () => {
    if (favorites.length === 0) {
      alert("No tienes productos en favoritos.");
      return;
    }

    setClearing(true);

    // Animación de borrado secuencial
    await new Promise((resolve) => {
      favorites.forEach((product, index) => {
        setTimeout(() => {
          setFavorites((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, isRemoving: true } : p))
          );
          if (index === favorites.length - 1) {
            resolve();
          }
        }, index * 100); // Retraso de 100ms entre cada animación
      });
    });

    try {
      await Promise.all(
        favorites.map((product) =>
          fetch(`https://localhost:4000/api/v1/favorites/${product.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      setFavorites([]);
      alert("Lista de favoritos vaciada ✅");
    } catch (err) {
      console.error("Error vaciando favoritos", err);
      alert("Error al vaciar la lista de favoritos");
    } finally {
      setClearing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog className="modal" size="lg" sx={{ borderRadius: "16px" }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Mis Favoritos
        </Typography>

        <Box id="ModalList">
          {loading ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              {[...Array(3)].map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "background.body",
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    overflow: "hidden",
                  }}
                >
                  <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 12, bgcolor: "grey.800" }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" sx={{ bgcolor: "grey.800" }} />
                    <Skeleton variant="text" width="60%" sx={{ bgcolor: "grey.800" }} />
                  </Box>
                  <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: "4px", bgcolor: "grey.800" }} />
                </Box>
              ))}
            </Box>
          ) : favorites.length === 0 ? (
            <Typography>No tienes productos favoritos.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {favorites.map((product) => (
                <Box
                  key={product.id}
                  // Aquí se aplica la clase de animación
                  className={product.isRemoving ? "slide-out-right" : ""}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "12px",
                    bgcolor: "background.body",
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    overflow: "hidden",
                    // Añade transición suave para que la animación funcione bien
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <div
                    className="borrarFav"
                    onClick={() => removeFavorite(product.id)}
                  >
                    <DeleteIcon />
                  </div>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <img
                      src={product.imagen_url}
                      alt={product.nombre_producto}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "scale-down",
                        borderRadius: 12,
                      }}
                    />
                    <Box>
                      <Typography level="body1" sx={{ fontWeight: "bold" }}>
                        {product.nombre_producto}
                      </Typography>
                      <Typography level="body2" color="neutral">
                        ${product.precio_producto}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: "bold" }}>
                        en stock
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    className="colorButon"
                    size="sm"
                    variant="solid"
                    color="primary"
                    onClick={() => addToCart(product.id)}
                    sx={{ marginRight: 4 }}
                  >
                    Añadir al carrito
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="outlined"
            color="danger"
            onClick={clearFavorites}
            startDecorator={<ClearAllIcon />}
            disabled={loading || clearing || favorites.length === 0}
          >
            Vaciar favoritos
          </Button>
          <Button
            className="colorButon"
            size="sm"
            variant="solid"
            color="primary"
            onClick={addAllToCart}
            startDecorator={<ShoppingCartIcon />}
            disabled={loading || clearing || favorites.length === 0}
          >
            Añadir todo al carrito
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}