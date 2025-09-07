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
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Not_found from "../assets/images/Not_found.png";
import { formatCOP } from "../services/currency";
import noImage from "../assets/images/no_image.png";

export default function FavoritesModal({ open, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const { t } = useTranslation();

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
          alert(t('favorites.addedToCart'));
        } else if (data.errors) {
          alert(t('favorites.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('favorites.cartError'), err);
        alert(t('favorites.cartError'));
      });
  };

  const addAllToCart = () => {
    if (favorites.length === 0) {
      alert(t('favorites.noProducts'));
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
          alert(t('favorites.someNotAdded'));
        } else {
          alert(t('favorites.allAddedToCart'));
        }
      })
      .catch((err) => {
        console.error(t('favorites.allCartError'), err);
        alert(t('favorites.allCartError'));
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
        setFavorites(data.map(p => ({ ...p, isRemoving: false })));
      }
    } catch (err) {
      console.error(t('favorites.loadError'), err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id) {
    try {
      const productToRemove = favorites.find((p) => p.id === id);
      if (!productToRemove) return;

      setFavorites((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isRemoving: true } : p))
      );

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
        setFavorites((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isRemoving: false } : p))
        );
      }
    } catch (err) {
      console.error(t('favorites.removeError'), err);
    }
  }

  const clearFavorites = async () => {
    if (favorites.length === 0) {
      alert(t('favorites.noProducts'));
      return;
    }

    setClearing(true);

    await new Promise((resolve) => {
      favorites.forEach((product, index) => {
        setTimeout(() => {
          setFavorites((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, isRemoving: true } : p))
          );
          if (index === favorites.length - 1) {
            resolve();
          }
        }, index * 100);
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
      alert(t('favorites.cleared'));
    } catch (err) {
      console.error(t('favorites.clearError'), err);
      alert(t('favorites.clearError'));
    } finally {
      setClearing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog className="modal" size="lg" sx={{ borderRadius: "16px" }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>
          {t('favorites.myFavorites')}
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
            <Box className="vacio">
              <img src={Not_found} alt={t('favorites.noFavorites')} />
              <Typography>{t('favorites.noFavorites')}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 2 }}>
              {favorites.map((product) => (
                <Box
                  key={product.id}
                  className={product.isRemoving ? "slide-out-right" : ""}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "12px",
                    bgcolor: "background.body",
                    border: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    overflow: "hidden",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  <div
                    className="borrarFav"
                    onClick={() => removeFavorite(product.id)}
                    title={t('favorites.remove')}
                  >
                    <DeleteIcon />
                  </div>

                  <Link
                    to={`/es/producto/${product.slug}`}
                    style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                    onClick={onClose}
                  >
                    <Box
                      key={product.id}
                      className={product.isRemoving ? "slide-out-right" : ""}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "12px",
                        bgcolor: "background.body",
                        borderColor: "neutral.outlinedBorder",
                        overflow: "hidden",
                        transition: "all 0.3s ease-in-out",
                        p: 2,
                        gap: 2,
                      }}
                    >

                      <img
                        src={product.imagen_url || noImage}
                        alt={product.nombre_producto}
                        onError={(e) => { e.currentTarget.src = noImage; }}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "scale-down",
                          borderRadius: 12,
                        }}
                      />

                      <Box sx={{ flex: 2 }}>
                        <Typography level="body1" sx={{ fontWeight: "bold" }}>
                          {product.nombre_producto}
                        </Typography>
                        <Typography level="body2" color="neutral">
                          {product.categoria}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography level="body2" sx={{ fontWeight: "bold" }}>
                          {formatCOP(product.precio_producto)}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography level="body2" color="neutral">
                          {product.fecha_agregado}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        {product.stock > 9 ? (
                          <Typography sx={{ fontWeight: "bold", color: "green" }}>
                            {t('favorites.inStock')}
                          </Typography>
                        ) : product.stock > 5 ? (
                          <Typography sx={{ fontWeight: "bold", color: "orange" }}>
                            {t('favorites.fewLeft')}
                          </Typography>
                        ) : product.stock > 0 ? (
                          <Typography sx={{ fontWeight: "bold", color: "#ff5405ff" }}>
                            {t('favorites.lastUnits')}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontWeight: "bold", color: "red" }}>
                            {t('favorites.soldOut')}
                          </Typography>
                        )}
                      </Box>

                    </Box>
                  </Link>

                  <Button
                    className="colorButon"
                    size="sm"
                    variant="solid"
                    color="primary"
                    onClick={() => addToCart(product.id)}
                    sx={{ marginRight: 4 }}
                  >
                    {t('favorites.addToCart')}
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
            {t('favorites.clearAll')}
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
            {t('favorites.addAllToCart')}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}