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
  };

  const clearCart = () => {
    setUpdating(true);
    
    // Crear un array de promesas para eliminar todos los productos
    const removalPromises = cart.products.flatMap(product => 
      Array.from({ length: product.cantidad }, () => 
        fetch("https://localhost:4000/api/v1/cart/remove_product", {
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
      })
      .finally(() => setUpdating(false));
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

  const handleProductClick = (productId) => {
    navigate(`/${lang}/producto/${productId}`);
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
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)'
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
            color="primary" 
            size="lg"
            startDecorator={<DiscountIcon />}
            sx={{ backgroundColor: 'rgba(255, 77, 148, 0.1)', color: '#ff4d94' }}
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
                  borderColor: '#ff80b0',
                  transform: 'translateY(-1px)'
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
                      opacity: 0.8,
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleProductClick(product.product_id)}
                >
                  <img 
                    src={product.imagen_url || noImage} 
                    alt={product.nombre_producto} 
                    style={{ 
                      width: 120, 
                      height: 120, 
                      objectFit: "cover",
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(255, 77, 148, 0.2)'
                    }} 
                  />
                </Box>
                
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    minWidth: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleProductClick(product.product_id)}
                >
                  <Typography level="title-lg" sx={{ 
                    mb: 1,
                    fontWeight: 600,
                    lineHeight: 1.3
                  }}>
                    {product.nombre_producto}
                  </Typography>
                  <Typography level="body2" sx={{ 
                    mb: 2,
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box
                      component="span"
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: product.color ? '#ff4d94' : 'neutral.300',
                        display: 'inline-block'
                      }}
                    />
                    {t("cart.set")}: {product.color || "N/A"}
                  </Typography>
                  
                  {/* PRECIO CON DESCUENTO */}
                  {product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography level="h4" fontWeight="bold" color="#ff4d94">
                        {formatCOP(product.precio_con_mejor_descuento)}
                      </Typography>
                      <Typography
                        level="body2"
                        sx={{ 
                          textDecoration: "line-through", 
                          color: "text.secondary",
                          fontSize: '0.9rem'
                        }}
                      >
                        {formatCOP(product.precio_producto)}
                      </Typography>
                      <Chip 
                        variant="soft" 
                        size="sm"
                        sx={{ 
                          ml: 1, 
                          backgroundColor: 'rgba(255, 77, 148, 0.1)', 
                          color: '#ff4d94',
                          borderColor: '#ff80b0'
                        }}
                      >
                        {Math.round((1 - product.precio_con_mejor_descuento / product.precio_producto) * 100)}% OFF
                      </Chip>
                    </Box>
                  ) : (
                    <Typography level="h4" fontWeight="bold" color="#ff4d94">
                      {formatCOP(product.precio_producto)}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1.5 
                }}>
                  <IconButton 
                    variant="outlined" 
                    size="sm"
                    disabled={updating || product.cantidad <= 1}
                    onClick={() => updateQuantity(product.product_id, false)}
                    sx={{
                      borderRadius: 'md',
                      borderColor: '#ff80b0',
                      color: '#ff4d94',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 77, 148, 0.1)',
                        borderColor: '#ff4d94'
                      }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <Chip 
                    variant="solid" 
                    size="lg"
                    sx={{ 
                      minWidth: 40,
                      backgroundColor: '#ff4d94',
                      color: 'white'
                    }}
                  >
                    <Typography fontWeight="bold" fontSize="sm">
                      {product.cantidad}
                    </Typography>
                  </Chip>
                  
                  <IconButton 
                    variant="outlined" 
                    size="sm"
                    disabled={updating}
                    onClick={() => updateQuantity(product.product_id, true)}
                    sx={{
                      borderRadius: 'md',
                      borderColor: '#ff80b0',
                      color: '#ff4d94',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 77, 148, 0.1)',
                        borderColor: '#ff4d94'
                      }
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                  <Typography level="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Subtotal
                  </Typography>
                  <Typography level="title-lg" fontWeight="bold" color="#ff4d94">
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
                  color="danger"
                  disabled={updating}
                  onClick={() => removeAllQuantity(
                    product.product_id, 
                    product.nombre_producto, 
                    product.cantidad
                  )}
                  sx={{ 
                    borderRadius: 'md',
                    backgroundColor: 'rgba(255, 77, 148, 0.1)',
                    color: '#ff4d94',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 77, 148, 0.2)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Stack>
      </Sheet>

      {/* Resumen del pedido - FIJADO */}
      <Sheet variant="outlined" sx={{ 
        width: { xs: "100%", lg: 400 }, 
        borderRadius: "md", 
        p: 3,
        alignSelf: "flex-start",
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        border: '2px solid',
        borderColor: '#ff80b0',
        boxShadow: '0 8px 32px rgba(255, 77, 148, 0.1)'
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
              {formatCOP(shippingCost)}
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
              {formatCOP(total + shippingCost)}
            </Typography>
          </Box>
        </Stack>
        
        <Stack spacing={1.5}>
          <Button
            fullWidth
            size="lg"
            onClick={handleCheckout}
            disabled={updating}
            startDecorator={<ShoppingCartCheckoutIcon />}
            sx={{ 
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ff4d94 0%, #ff6b9c 100%)',
              boxShadow: '0 4px 16px rgba(255, 77, 148, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ff6b9c 0%, #ff80b0 100%)',
                boxShadow: '0 6px 20px rgba(255, 77, 148, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              },
              transition: 'all 0.2s ease-in-out'
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
              borderColor: '#ff4d94',
              color: '#ff4d94',
              '&:hover': {
                borderWidth: 2,
                borderColor: '#ff4d94',
                backgroundColor: 'rgba(255, 77, 148, 0.1)',
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