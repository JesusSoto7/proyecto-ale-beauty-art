import React, { useEffect, useState } from "react";
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
  Sheet
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

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem("token");
  const { lang } = useParams();
  const { t, i18n } = useTranslation();

  // Cambiar idioma según URL
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  useEffect(() => {
    fetchCart();
  }, [token]);

  const fetchCart = () => {
    setLoading(true);
    setError(null);
    fetch("https://localhost:4000/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => setCart(data))
      .catch((err) => {
        console.error("Error cargando cart: ", err);
        setError(t("cart.loadingError"));
      })
      .finally(() => setLoading(false));
  };

  const updateQuantity = (productId, increment = true) => {
    setUpdating(true);

    const url = increment
      ? "https://localhost:4000/api/v1/cart/add_product"
      : "https://localhost:4000/api/v1/cart/remove_product";

    fetch(url, {
      method: increment ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then((data) => {
        if (data?.cart) {
          setCart(data.cart);
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
          // ✅ Si es incremento, dispara el evento GA4
          if (increment && window.gtag) {
            const product = data.cart.products.find(
              (p) => p.product_id === productId
            );

            if (product) {
              window.gtag("event", "add_to_cart", {
                currency: "COP",
                value: product.precio_producto,
                items: [
                  {
                    item_id: product.product_id,
                    item_name: product.nombre_producto,
                    price: product.precio_producto,
                    quantity: product.cantidad,
                  },
                ],
              });

              console.log("🛒 Evento GA4 enviado: add_to_cart", product);
            }
          }
        }
      })
      .catch(() => setError(t("cart.updatingError")))
      .finally(() => setUpdating(false));
  };


  const removeAllQuantity = (productId, productName, quantity) => {
    if (window.confirm(t("cart.removeConfirm", { product: productName, quantity }))) {
      const removalPromises = [];

      for (let i = 0; i < quantity; i++) {
        removalPromises.push(
          fetch("https://localhost:4000/api/v1/cart/remove_product", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_id: productId }),
          }).then((res) => {
            if (!res.ok) throw new Error("Remove failed");
            return res.json();
          })
        );
      }

      Promise.all(removalPromises)
        .then((results) => {
          // Tomar el último resultado para actualizar el estado
          const lastResult = results[results.length - 1];
          setCart(lastResult.cart);

          // Notificar al Header para que se actualice
          window.dispatchEvent(new CustomEvent("cartUpdatedCustom", { bubbles: false }));
        })
        .catch(() => {
          setError(t("cart.updatingError"));
          fetchCart(); // mantener sincronización
        });
    }
  };


  const handleCheckout = () => {
    fetch("https://localhost:4000/api/v1/orders", {
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
        <Button onClick={fetchCart} variant="outlined">
          {t("cart.retry")}
        </Button>
      </Box>
    );
  }

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
    (sum, p) => sum + p.precio_producto * p.cantidad,
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
        borderRadius: "sm", 
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, lg: 0 }
      }}>
        <Typography level="h2" sx={{ mb: 3 }}>{t("cart.title")}</Typography>
        
        {cart.products.map((product) => (
          <Box key={product.product_id}>
            <Box sx={{ 
              display: "flex", 
              gap: 2, 
              py: 2,
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" }
            }}>
              <img 
                src={product.imagen_url || noImage} 
                alt={product.nombre_producto} 
                style={{ 
                  width: 100, 
                  height: 100, 
                  objectFit: "cover",
                  borderRadius: 8
                }} 
              />
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography level="title-md" sx={{ mb: 0.5 }}>
                  {product.nombre_producto}
                </Typography>
                <Typography level="body2" sx={{ mb: 1 }}>
                  {t("cart.set")}: {product.color || "N/A"}
                </Typography>
                <Typography level="body1" fontWeight="bold">
                  {formatCOP(product.precio_producto)}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1 
              }}>
                <IconButton 
                  variant="outlined" 
                  size="sm"
                  disabled={updating || product.cantidad <= 1}
                  onClick={() => updateQuantity(product.product_id, false)}
                >
                  <RemoveIcon />
                </IconButton>
                
                <Chip variant="soft" color="neutral">
                  <Typography fontWeight="lg">{product.cantidad}</Typography>
                </Chip>
                
                <IconButton 
                  variant="outlined" 
                  size="sm"
                  disabled={updating}
                  onClick={() => updateQuantity(product.product_id, true)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Typography level="body1" fontWeight="bold" sx={{ minWidth: 100, textAlign: "right" }}>
                {formatCOP(product.precio_producto * product.cantidad)}
              </Typography>
              
              <IconButton 
                variant="plain" 
                color="danger"
                disabled={updating}
                onClick={() => removeAllQuantity(
                  product.product_id, 
                  product.nombre_producto, 
                  product.cantidad
                )}
                sx={{ ml: 1 }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Sheet>

      {/* Resumen del pedido */}
      <Sheet variant="outlined" sx={{ 
        width: { xs: "100%", lg: 350 }, 
        borderRadius: "sm", 
        p: 3,
        alignSelf: "flex-start",
        position: "sticky",
        top: 20
      }}>
        <Typography level="h4" sx={{ mb: 2 }}>{t("cart.summary")}</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography level="body2">{t("cart.products")} ({cantidad})</Typography>
            <Typography level="body2">{formatCOP(total)}</Typography>
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography level="body2">{t("cart.shipping")}</Typography>
            <Typography level="body2">{formatCOP(shippingCost)}</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography level="title-lg">{t("cart.total")}</Typography>
            <Typography level="title-lg">{formatCOP(total + shippingCost)}</Typography>
          </Box>
        </Box>
        
        <Button
          fullWidth
          size="lg"
          onClick={handleCheckout}
          disabled={updating}
          startDecorator={<ShoppingCartCheckoutIcon />}
          sx={{ 
            mb: 2,
            backgroundColor: '#ff4d94',
            '&:hover': {
              backgroundColor: '#ff80b0',
            }
          }}
        >
          {t("cart.buy")}
        </Button>
      </Sheet>
    </Box>
  );
}

export default Cart;