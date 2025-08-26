// src/components/FavoritesModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import DeleteIcon from "@mui/icons-material/Delete"; // Ícono basura
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Ícono carrito
import ClearAllIcon from "@mui/icons-material/ClearAll"; // Ícono vaciar lista

export default function FavoritesModal({ open, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState(null);

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
          setCart(data.cart);
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
    try {
      const res = await fetch("https://localhost:4000/api/v1/favorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error cargando favoritos", err);
    }
  }

  async function removeFavorite(id) {
    try {
      const res = await fetch(`https://localhost:4000/api/v1/favorites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
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
          {favorites.length === 0 ? (
            <Typography>No tienes productos favoritos.</Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {favorites.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "12px",
                    bgcolor: "background.body",
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    overflow: "hidden",
                  }}
                >
                  {/* Botón borrar ocupa todo el alto */}
                  <div
                    className="borrarFav"
                    onClick={() => removeFavorite(product.id)}
                  >
                    <DeleteIcon />
                  </div>

                  {/* Info con su padding */}
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

                  {/* Botón añadir al carrito */}
                  <Button
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

        {/* Botones de acción en la parte inferior */}
        <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="outlined"
            color="danger"
            onClick={clearFavorites}
            startDecorator={<ClearAllIcon />}
          >
            Vaciar favoritos
          </Button>

          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={addAllToCart}
            startDecorator={<ShoppingCartIcon />}
          >
            Añadir todo al carrito
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
