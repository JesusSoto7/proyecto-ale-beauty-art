import React, { useState, useEffect } from "react";
import { useMediaQuery } from '@mui/material';
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
  const [cart, setCart] = useState(null);
  const isNarrow = useMediaQuery('(max-width: 400px)');
  // Apilar sólo hasta 1023px. Desde 1024px horizontal completo.
  const isStack = useMediaQuery('(max-width:1023px)');
  // Solicitud: también integrar precio + stock + botón en filas para anchos 540, 853, 912.
  // Activamos integración en stacked layout a partir de 540px.
  const isInlineStack = useMediaQuery('(min-width:540px)');

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
          alert(t('favorites.addedToCart'));
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
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
        }).then(async (res) => {
          const data = await res.json().catch(() => null);
          return res.ok ? data : { errors: true };
        })
      )
    )
      .then((results) => {
        const errors = results.filter((r) => r?.errors);
        const lastCart = results.reverse().find((r) => r?.cart);

        if (errors.length > 0) {
          alert(t('favorites.someNotAdded'));
        } else {
          alert(t('favorites.allAddedToCart'));
        }

        if (lastCart) {
          setCart(lastCart.cart);
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
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
    } catch (err) {
      console.error(t('favorites.clearError'), err);
      alert(t('favorites.clearError'));
    } finally {
      setClearing(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        className="modal"
        size="lg"
        sx={{
          width: { xs: '92vw', sm: '88vw', md: '75vw', lg: 960 },
          maxWidth: '95vw',
          maxHeight: { xs: '85vh', md: '80vh' },
          overflow: 'hidden',
          borderRadius: { xs: 3, md: 4 },
          p: { xs: 2, md: 3 },
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2, fontSize: { xs: '1.1rem', md: '1.4rem' } }}>
          {t('favorites.myFavorites')}
        </Typography>

        <Box id="ModalList" sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
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
              {favorites.map((product) => {
                const priceOriginal = product.precio_producto;
                const priceDiscount = product.precio_con_mejor_descuento;

                return (
                  <Box
                    key={product.id}
                    className={product.isRemoving ? "slide-out-right" : ""}
                    sx={{
                      display: 'flex',
                      flexDirection: isStack ? 'column' : 'row',
                      alignItems: isStack ? 'stretch' : 'center',
                      borderRadius: '12px',
                      bgcolor: 'background.body',
                      border: '1px solid',
                      borderColor: 'neutral.outlinedBorder',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative'
                    }}
                  >
                    <div
                      className="borrarFav"
                      onClick={() => removeFavorite(product.id)}
                      title={t('favorites.remove')}
                      style={{
                        background: '#f5f5f5',
                        color: '#999',
                        width: '28px',
                        minHeight: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: isStack ? '0px' : '0px',
                        borderTopRightRadius: '0px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                        position: isStack ? 'absolute' : 'static',
                        top: isStack ? '0' : 'auto',
                        left: isStack ? '0' : 'auto',
                        zIndex: isStack ? '1' : 'auto',
                        border: '1px solid #e0e0e0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff1744';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.width = '32px'; // Se expande ligeramente al hover
                        e.currentTarget.style.borderColor = '#ff1744';
                      }}
                      onMouseLeave={(e) => {
                        if (!product.isRemoving) {
                          e.currentTarget.style.background = '#f5f5f5';
                          e.currentTarget.style.color = '#999';
                          e.currentTarget.style.width = '28px'; // Vuelve a ser delgado
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.background = '#d50000';
                        e.currentTarget.style.transform = 'scale(0.98)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {product.isRemoving ? '×' : <DeleteIcon fontSize="small" />}
                    </div>
                    {/* Bloque superior: imagen + nombre (en stack solo esto dentro del link) */}
                    <Link
                      to={`/es/producto/${product.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: isStack ? 'none' : 1,
                        marginLeft: isStack ? '28px' : '0' // Compensa el botón más delgado
                      }}
                      onClick={onClose}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          gap: 2,
                          flex: 1
                        }}
                      >
                        <img
                          src={product.imagen_url || noImage}
                          alt={product.nombre_producto}
                          onError={(e) => { e.currentTarget.src = noImage; }}
                          style={{ width: 60, height: 60, objectFit: 'scale-down', borderRadius: 12 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography level="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.6 }}>
                            <span>{product.nombre_producto}</span>
                            {/* Categoría al lado del nombre */}
                            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#555', letterSpacing: '0.3px' }}>· {product.categoria}</span>
                            {/* Estado sólo en bloque superior cuando <540px */}
                            {isStack && !isInlineStack && (
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: product.stock > 9 ? 'green' : product.stock > 5 ? 'orange' : product.stock > 0 ? '#ff5405ff' : 'red'
                              }}>
                                {product.stock > 9
                                  ? t('favorites.inStock')
                                  : product.stock > 5
                                    ? t('favorites.fewLeft')
                                    : product.stock > 0
                                      ? t('favorites.lastUnits')
                                      : t('favorites.soldOut')}
                              </span>
                            )}
                          </Typography>
                          {/* Precio debajo del nombre cuando layout es stacked (cualquier ancho <=1023) */}
                          {isStack && (
                            <Box sx={{ mt: 0.5 }}>
                              {priceDiscount && priceDiscount < priceOriginal ? (
                                <>
                                  <Typography level="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                                    {formatCOP(priceDiscount)}
                                  </Typography>
                                  <Typography level="body2" sx={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.7rem' }}>
                                    {formatCOP(priceOriginal)}
                                  </Typography>
                                </>
                              ) : (
                                <Typography level="body2" sx={{ fontWeight: 'bold' }}>
                                  {formatCOP(priceOriginal)}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                        {/* Fila derecha: desktop muestra precio+stock+botón; stacked >=540 sólo botón a la derecha */}
                        {(!isStack || (isStack && isInlineStack)) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                            {/* Desktop: precio + stock */}
                            {!isStack && (
                              <>
                                <Box sx={{ textAlign: 'right', minWidth: 82 }}>
                                  {priceDiscount && priceDiscount < priceOriginal ? (
                                    <>
                                      <Typography level="body2" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
                                        {formatCOP(priceDiscount)}
                                      </Typography>
                                      <Typography level="body2" sx={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.7rem' }}>
                                        {formatCOP(priceOriginal)}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography level="body2" sx={{ fontWeight: 'bold' }}>
                                      {formatCOP(priceOriginal)}
                                    </Typography>
                                  )}
                                </Box>
                                <Box sx={{ minWidth: 70 }}>
                                  {product.stock > 9 ? (
                                    <Typography sx={{ fontWeight: 'bold', color: 'green', fontSize: '0.7rem' }}>{t('favorites.inStock')}</Typography>
                                  ) : product.stock > 5 ? (
                                    <Typography sx={{ fontWeight: 'bold', color: 'orange', fontSize: '0.7rem' }}>{t('favorites.fewLeft')}</Typography>
                                  ) : product.stock > 0 ? (
                                    <Typography sx={{ fontWeight: 'bold', color: '#ff5405ff', fontSize: '0.7rem' }}>{t('favorites.lastUnits')}</Typography>
                                  ) : (
                                    <Typography sx={{ fontWeight: 'bold', color: 'red', fontSize: '0.7rem' }}>{t('favorites.soldOut')}</Typography>
                                  )}
                                </Box>
                              </>
                            )}
                            {/* Stacked >=540px: mostrar estado (sin precio para evitar duplicado) */}
                            {isStack && isInlineStack && (
                              <Box sx={{ minWidth: 70 }}>
                                {product.stock > 9 ? (
                                  <Typography sx={{ fontWeight: 'bold', color: 'green', fontSize: '0.65rem' }}>{t('favorites.inStock')}</Typography>
                                ) : product.stock > 5 ? (
                                  <Typography sx={{ fontWeight: 'bold', color: 'orange', fontSize: '0.65rem' }}>{t('favorites.fewLeft')}</Typography>
                                ) : product.stock > 0 ? (
                                  <Typography sx={{ fontWeight: 'bold', color: '#ff5405ff', fontSize: '0.65rem' }}>{t('favorites.lastUnits')}</Typography>
                                ) : (
                                  <Typography sx={{ fontWeight: 'bold', color: 'red', fontSize: '0.65rem' }}>{t('favorites.soldOut')}</Typography>
                                )}
                              </Box>
                            )}
                            <Button
                              className="colorButon"
                              size="sm"
                              variant="solid"
                              color="primary"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id); }}
                              sx={{ whiteSpace: 'nowrap', px: 2.2 }}
                            >
                              {t('favorites.addToCart')}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Link>

                    {/* Bloque inferior (stack <540px): solo botón (precio ya mostrado arriba) */}
                    {isStack && !isInlineStack && (
                      <Box sx={{ px: 2, pb: 2, pt: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '28px' }}>
                        <Button
                          className="colorButon"
                          size="sm"
                          variant="solid"
                          color="primary"
                          onClick={() => addToCart(product.id)}
                          sx={{ ml: 'auto', flexGrow: 1 }}
                        >
                          {t('favorites.addToCart')}
                        </Button>
                      </Box>
                    )}

                    {/* Botón eliminado fuera del enlace en layout horizontal; ahora integrado */}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, justifyContent: 'flex-end' }}>
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
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            {t('favorites.addAllToCart')}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}