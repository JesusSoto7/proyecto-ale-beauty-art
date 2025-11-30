import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Divider,
  Alert,
  Skeleton,
  Chip,
  Sheet,
  Stack
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import Not_found from "../assets/images/not_found.png";
import { formatCOP } from "../services/currency";
import noImage from "../assets/images/no_image.png";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DiscountIcon from "@mui/icons-material/Discount";

// Guest cart helpers
import {
  getGuestCart,
  updateQty as guestUpdateQty,
  removeItem as guestRemoveItem,
  clearCart as guestClearCart,
} from "../utils/guestCart";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [mode, setMode] = useState("guest"); // 'guest' | 'auth'
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem("token");
  const { lang } = useParams();
  const { t, i18n } = useTranslation();

  // Cambiar idioma según URL
  useEffect(() => {
    if (lang) i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // Mapear guestCart->cart.products con la misma forma que el backend
  const mapGuestToCart = (guest) => {
    const items = guest?.items || [];
    return {
      id: null,
      products: items.map((i) => ({
        product_id: i.id,
        nombre_producto: i.name,
        precio_producto: Number(i.price || 0),
        precio_con_mejor_descuento: Number(i.price || 0),
        cantidad: Number(i.quantity || 1),
        imagen_url: i.image || null,
      })),
    };
  };

  // Eliminar todas las unidades de un producto del carrito
  const removeAllQuantity = async (productId) => {
    if (mode === "guest") {
      guestRemoveItem(productId);
      setCart(mapGuestToCart(getGuestCart()));
      window.dispatchEvent(new CustomEvent("guestCartUpdated"));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/cart/remove_all_product`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
      } else {
        setError(t("cart.updatingError"));
        console.warn("Error eliminando producto del carrito", await response.json());
      }
    } catch (error) {
      setError(t("cart.updatingError"));
      console.error(error);
    }
  };

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    let updatedCart = null;

    if (!token) {
      setMode("guest");
      const guest = getGuestCart();
      updatedCart = mapGuestToCart(guest);
    } else {
      try {
        const res = await fetch(`${API_BASE}/api/v1/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        const serverCart = data?.cart || data;
        updatedCart = serverCart;
        setMode("auth");
      } catch (err) {
        // Fallback a modo invitado si falla
        setMode("guest");
        const guest = getGuestCart();
        updatedCart = mapGuestToCart(guest);
      }
    }

    // Ajustar cantidades según el stock disponible
    if (updatedCart) {
      updatedCart.products = updatedCart.products.map((product) => ({
        ...product,
        cantidad: Math.min(product.cantidad, product.stock),
      }));
    }

    setCart(updatedCart);
    setLoading(false);
  }, [API_BASE, token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);


  // Escuchar cambios del carrito invitado
  useEffect(() => {
    const onGuestUpdate = () => setCart(mapGuestToCart(getGuestCart()));
    window.addEventListener("guestCartUpdated", onGuestUpdate);
    return () => window.removeEventListener("guestCartUpdated", onGuestUpdate);
  }, []);

  async function updateQuantity(productId, increment = true) {
    const product = cart.products.find((p) => p.product_id === productId);

    if (!product) {
      console.error(`Producto con ID ${productId} no encontrado en el carrito.`);
      return;
    }

    const newQuantity = increment ? product.cantidad + 1 : product.cantidad - 1;

    // Limitar cantidad según stock disponible
    if (newQuantity > product.stock) {
      console.warn(`La cantidad excede el stock disponible para el producto ID ${productId}.`);
      return;
    }

    if (newQuantity <= 0) {
      await removeAllQuantity(productId);
      return;
    }

    // Actualizar carrito en autenticación/servidor
    try {
      const url = increment
        ? `${API_BASE}/api/v1/cart/add_product`
        : `${API_BASE}/api/v1/cart/remove_product`;

      const method = increment ? "POST" : "DELETE";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.cart); // Actualizar el carrito global
        window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false })); // Reflejar cambios en el Header
      } else {
        console.warn("Error al actualizar producto", await response.json());
      }
    } catch (error) {
      console.error("Error actualizando cantidad del producto:", error);
    }
  };

  const clearCart = async () => {
    setUpdating(true);
    setError(null);

    if (mode === "guest") {
      guestClearCart();
      setCart({ id: null, products: [] });
      window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false })); // Emitir el evento para reflejar el cambio
      setUpdating(false);
      return;
    }

    // Modo autenticado
    try {
      const removalPromises = cart.products.flatMap((product) =>
        Array.from({ length: product.cantidad }, () =>
          fetch(`${API_BASE}/api/v1/cart/remove_product`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_id: product.product_id }),
          }).then((res) => {
            if (!res.ok) throw new Error("Remove failed");
            return res.json();
          })
        )
      );
      await Promise.all(removalPromises);
      setCart({ id: null, products: [] });
      window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false })); // Emitir el evento para reflejar el cambio
    } catch {
      setError(t("cart.updatingError"));
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (mode === "guest") {
      navigate(`/${lang}/guest-checkout`, {
        state: {
          mode: "guest",
          guestCart: cart, // { id:null, products:[...] }
        },
      });
      return;
    }
    fetch(`${API_BASE}/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Checkout failed");
        return res.json();
      })
      .then((data) => {
        if (data.order) {
          navigate(`/${lang}/checkout`, {
            state: {
              orderId: data.order.id,
              total: data.order.pago_total
            }
          });
        } else {
          setError(t("cart.orderError"));
        }
      })
      .catch(() => setError(t("cart.orderError")));
  };

  const handleProductClick = (slug) => {
    navigate(`/${lang}/producto/${slug}`);
  };

  // Loading
  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Typography level="h2" sx={{ mb: 3 }}>{t("cart.title")}</Typography>
        {[1, 2, 3].map((item) => (
          <Card key={item} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="rectangular" width={100} height={100} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Skeleton variant="circular" width={30} height={30} />
                  <Skeleton variant="text" width={20} />
                  <Skeleton variant="circular" width={30} height={30} />
                </Box>
              </Box>
              <Skeleton variant="text" width={80} />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", textAlign: "center" }}>
        <Alert
          color="danger"
          variant="soft"
          startDecorator={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        <Button onClick={loadCart} variant="outlined">
          {t("cart.retry")}
        </Button>
      </Box>
    );
  }

  // Vacío
  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 2,
        textAlign: "center"
      }}>
        <img
          src={Not_found}
          alt={t("cart.empty")}
          style={{
            marginBottom: "24px",
            maxWidth: "300px",
            width: "100%"
          }}
        />
        <Typography level="h4" sx={{ mb: 2 }}>
          {t("cart.empty")}
        </Typography>
      </Box>
    );
  }

  const total = cart.products.reduce(
    (sum, p) => sum + (p.precio_con_mejor_descuento && p.precio_con_mejor_descuento < p.precio_producto ? p.precio_con_mejor_descuento : p.precio_producto) * p.cantidad,
    0
  );

  const cantidad = cart.products.reduce((acc, p) => acc + p.cantidad, 0);
  const shippingCost = 10000;

  return (
    <Box sx={{
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: 1200,
      mx: "auto",
      display: "flex",
      marginTop: "80px",
      flexDirection: { xs: "column", lg: "row" },
      gap: 3
    }}>
      {/* Lista de productos */}
      <Sheet variant="outlined" sx={{
        flex: 1,
        borderRadius: "md",
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, lg: 0 },
        backgroundColor: 'background.surface'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h2" sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 700,
            color: 'text.primary'
          }}>
            {t("cart.title")}
          </Typography>
          <Chip
            variant="soft"
            sx={{
              backgroundColor: 'rgba(255, 77, 148, 0.1)',
              color: '#ff4d94',
              fontSize: '1rem',
              fontWeight: 600
            }}
            size="lg"
            startDecorator={<DiscountIcon />}
          >
            {cantidad} {t("cart.items")}
          </Chip>
        </Box>

        <Stack spacing={2}>
          {cart.products.map((product) => (
            <Card
              key={product.product_id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 'md',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 'md',
                  borderColor: product.stock > 0 ? '#ff80b0' : '#ccc',
                  transform: product.stock > 0 ? 'translateY(-1px)' : 'none'
                }
              }}
            >
              <Box sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexDirection: { xs: "column", sm: "row" }
              }}>
                <Box
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      opacity: product.stock > 0 ? 0.8 : 1,
                      transform: product.stock > 0 ? 'scale(1.02)' : 'none'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={product.stock > 0 ? () => handleProductClick(product.slug) : undefined}
                >
                  <img
                    src={product.imagen_url || noImage}
                    alt={product.nombre_producto}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 12,
                      boxShadow: product.stock > 0 ? '0 4px 12px rgba(255, 77, 148, 0.2)' : '0 2px 6px rgba(0,0,0,0.1)',
                      filter: product.stock > 0 ? 'none' : 'grayscale(100%)'
                    }}
                  />
                  {product.stock === 0 && (
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'background.surface',
                        color: '#f44336',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t("cart.outOfStock")}
                    </Chip>
                  )}
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    cursor: product.stock > 0 ? 'pointer' : 'default',
                  }}
                  onClick={product.stock > 0 ? () => handleProductClick(product.slug) : undefined}
                >
                  <Typography level="title-lg" sx={{
                    mb: 1,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: product.stock > 0 ? 'text.primary' : 'text.disabled'
                  }}>
                    {product.nombre_producto}
                  </Typography>

                  {product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography level="h4" fontWeight="bold" color={product.stock > 0 ? "#ff4d94" : "text.disabled"}>
                        {formatCOP(product.precio_con_mejor_descuento)}
                      </Typography>
                      <Typography
                        level="body2"
                        sx={{
                          textDecoration: "line-through",
                          color: product.stock > 0 ? "text.secondary" : "text.disabled",
                          fontSize: '0.9rem'
                        }}
                      >
                        {formatCOP(product.precio_producto)}
                      </Typography>
                      {product.stock > 0 && (
                        <Chip
                          variant="soft"
                          size="sm"
                          sx={{
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            color: '#4caf50',
                            borderColor: '#4caf50'
                          }}
                        >
                          {Math.round((1 - product.precio_con_mejor_descuento / product.precio_producto) * 100)}% OFF
                        </Chip>
                      )}
                    </Box>
                  ) : (
                    <Typography level="h4" fontWeight="bold" color={product.stock > 0 ? "#ff4d94" : "text.disabled"}>
                      {formatCOP(product.precio_producto)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <IconButton
                    variant="outlined"
                    size="sm"
                    disabled={updating || product.cantidad <= 1 || product.stock === 0}
                    onClick={() => updateQuantity(product.product_id, false)}
                    sx={{
                      borderRadius: 'md',
                      borderColor: product.stock > 0 ? '#ff80b0' : '#ccc',
                      color: product.stock > 0 ? '#ff4d94' : 'text.disabled',
                      '&:hover': product.stock > 0 ? {
                        backgroundColor: 'rgba(255, 77, 148, 0.1)',
                        borderColor: '#ff4d94'
                      } : undefined
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <Chip
                    variant="solid"
                    size="lg"
                    sx={{
                      minWidth: 32,
                      backgroundColor: product.stock > 0 ? '#ff4d94' : '#ddd',
                      color: product.stock > 0 ? 'white' : 'text.disabled',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography fontWeight="bold" fontSize="sm" sx={{ lineHeight: 1, color: 'inherit' }}>
                      {product.cantidad}
                    </Typography>
                  </Chip>

                  <IconButton
                    variant="outlined"
                    size="sm"
                    disabled={updating || product.cantidad >= product.stock || product.stock === 0}
                    onClick={() => updateQuantity(product.product_id, true)}
                    sx={{
                      borderRadius: 'md',
                      borderColor: product.stock > 0 ? '#ff80b0' : '#ccc',
                      color: product.stock > 0 ? '#ff4d94' : 'text.disabled',
                      '&:hover': product.stock > 0 ? {
                        backgroundColor: 'rgba(255, 77, 148, 0.1)',
                        borderColor: '#ff4d94',
                      } : undefined,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography level="title-lg" fontWeight="bold" color={product.stock > 0 ? "#ff4d94" : "text.disabled"}>
                    {formatCOP(
                      (product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto
                        ? product.precio_con_mejor_descuento
                        : product.precio_producto
                      ) * product.cantidad
                    )}
                  </Typography>
                </Box>

                <IconButton
                  variant="soft"
                  sx={{
                    borderRadius: 'md',
                    backgroundColor: product.stock > 0 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0,0,0,0.05)',
                    color: product.stock > 0 ? '#f44336' : 'text.disabled',
                    '&:hover': product.stock > 0 ? {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      transform: 'scale(1.1)'
                    } : undefined,
                    transition: 'all 0.2s ease-in-out'
                  }}
                  disabled={updating || product.stock === 0}
                  onClick={product.stock > 0 ? () => removeAllQuantity(product.product_id) : undefined}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Stack>
      </Sheet>

      {/* Resumen del pedido */}
      <Sheet variant="outlined" sx={{
        width: { xs: "100%", lg: 400 },
        borderRadius: "md",
        p: 3,
        alignSelf: "flex-start",
        backgroundColor: 'background.surface'
      }}>
        <Typography level="h3" sx={{
          mb: 3,
          textAlign: 'center',
          fontWeight: 700,
          color: 'text.primary'
        }}>
          {t("cart.summary")}
        </Typography>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center',
            p: 1.5,
            borderRadius: 'md',
            backgroundColor: 'rgba(255, 77, 148, 0.05)'
          }}>
            <Typography level="body1" fontWeight="medium">
              {t("cart.products")} ({cantidad})
            </Typography>
            <Typography level="body1" fontWeight="bold" color="#ff4d94">
              {formatCOP(total)}
            </Typography>
          </Box>

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center',
            p: 1.5,
            borderRadius: 'md',
            backgroundColor: 'rgba(255, 77, 148, 0.05)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon sx={{ fontSize: 20, color: '#ff4d94' }} />
              <Typography level="body1" fontWeight="medium">
                {t("cart.shipping")}
              </Typography>
            </Box>
            <Typography level="body1" fontWeight="bold" color="#ff4d94">
              {formatCOP(10000)}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: 'center',
            p: 2,
            borderRadius: 'md',
            backgroundColor: 'rgba(255, 77, 148, 0.1)',
            border: '1px solid',
            borderColor: '#ff80b0'
          }}>
            <Typography level="title-lg" fontWeight="bold">
              {t("cart.total")}
            </Typography>
            <Typography level="h4" fontWeight="bold" color="#ff4d94">
              {formatCOP(total + 10000)}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.5}>
          <Button
            fullWidth
            size="lg"
            onClick={handleCheckout}
            disabled={updating || !cart.products.some((p) => p.stock > 0) || cart.products.some((p) => p.cantidad > p.stock)} // Se inhabilita si hay productos con cantidades que superan el stock
            startDecorator={<ShoppingCartCheckoutIcon />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: updating || !cart.products.some((p) => p.stock > 0) || cart.products.some((p) => p.cantidad > p.stock)
                ? 'rgba(0,0,0,0.1)'
                : 'linear-gradient(135deg, #ff4d94 0%, #ff6b9c 100%)',
              boxShadow: updating || !cart.products.some((p) => p.stock > 0) || cart.products.some((p) => p.cantidad > p.stock)
                ? 'none'
                : '0 4px 16px rgba(255, 77, 148, 0.3)',
              color: updating || !cart.products.some((p) => p.stock > 0) || cart.products.some((p) => p.cantidad > p.stock)
                ? '#aaa'
                : '#fff',
              '&:hover': !updating &&
                cart.products.some((p) => p.stock > 0) &&
                !cart.products.some((p) => p.cantidad > p.stock) && {
                background: 'linear-gradient(135deg, #ff6b9c 0%, #ff80b0 100%)',
                boxShadow: '0 6px 20px rgba(255, 77, 148, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {t("cart.buy")}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={clearCart}
            disabled={updating}
            startDecorator={<DeleteSweepIcon />}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              borderWidth: 2,
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#f44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {t("cart.clearAll")}
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}

export default Cart;