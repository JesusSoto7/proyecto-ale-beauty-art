// src/components/FavoritesModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

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

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg">
        <ModalClose />
        <Typography level="h4">Mis Favoritos</Typography>

        {favorites.length === 0 ? (
          <Typography>No tienes productos favoritos.</Typography>
        ) : (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            {favorites.map((product) => (
              <Box
                key={product.id}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <img
                  src={product.imagen_url}
                  alt={product.nombre_producto}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Box>
                  <Typography level="body1">{product.nombre_producto}</Typography>
                  <Typography level="body2">${product.precio_producto}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
