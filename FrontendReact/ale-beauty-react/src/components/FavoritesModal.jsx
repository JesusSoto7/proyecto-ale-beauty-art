// src/components/FavoritesModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import DeleteIcon from "@mui/icons-material/Delete"; // Ícono basura
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "../pages/inicio/Inicio.jsx"; // Ícono carrito

export default function FavoritesModal({ open, onClose }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (open) {
      fetchFavorites();
    }
  }, [open]);

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

  function addToCart(product) {
    console.log("Añadido al carrito:", product);
    // aquí iría tu lógica de carrito (contexto, redux o API)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog className="modal" size="lg" sx={{ borderRadius: "16px" }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          Mis Favoritos
        </Typography>

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
                  overflow: "hidden"
                }}
              >
                {/* Botón borrar ocupa todo el alto */}
                <div className="borrarFav" onClick={() => removeFavorite(product.id)}>
                  <DeleteIcon />
                </div>

                {/* Info con su padding */}
                <Box sx={{ flex: 1, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
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
                </Box>

                {/* Botón añadir al carrito */}
                <Button size="sm" variant="solid" color="primary" onClick={() => addToCart(prod.id)} sx={{marginRight: 4,}}>
                  Añadir
                </Button>
              </Box>

            ))}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
