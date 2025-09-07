import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/joy";
import { useTranslation } from "react-i18next";
import Not_found from "../assets/images/not_found.png";
import { formatCOP } from "../services/currency";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
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
    fetch("https://localhost:4000/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCart(data))
      .catch((err) => console.error("Error cargando cart: ", err));
  }, [token]);

  const updateQuantity = (productId, increment = true) => {
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
      .then((res) => res.json())
      .then((data) => data && setCart(data.cart))
      .catch(() => alert(t("cart.updatingError")));
  };

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <Box className="vacio" sx={{ textAlign: "center", mt: 4 }}>
        <img src={Not_found} alt="cart empty" style={{ marginBottom: "16px" }} />
        <Typography level="h6" color="neutral">
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

  const handleCheckout = () => {
    fetch("https://localhost:4000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          navigate(`/${lang}/checkout`, {
            state: {
              orderId: data.order.id,
              total: data.order.pago_total
            }
          });
        } else {
          alert(t("cart.orderError"));
        }
      })
      .catch(() => alert(t("cart.orderError")));
  };

  return (
    <div className="cart-container">
      <div className="cart-table">
        <h1>{t("cart.title")}</h1>
        {cart.products.map((product) => (
          <div className="cart-row" key={product.product_id}>
            <div className="cart-product">
              <img src={product.imagen_url} alt={product.nombre_producto} />
              <div>
                <h4>{product.nombre_producto}</h4>
                <p>{t("cart.set")}: {product.color || "N/A"}</p>
              </div>
            </div>
            <div className="cart-quantity">
              <button onClick={() => updateQuantity(product.product_id, true)}>+</button>
              <span>{product.cantidad}</span>
              <button onClick={() => updateQuantity(product.product_id, false)}>-</button>
            </div>
            <div className="cart-price">
              {formatCOP(product.precio_producto * product.cantidad)}
            </div>
            <div
              className="cart-remove"
              onClick={() =>
                [...Array(product.cantidad)].forEach(() =>
                  updateQuantity(product.product_id, false)
                )
              }
            >
              🗑
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h4>{t("cart.summary")}</h4>
        <div className="summary-row">
          <span>{t("cart.products")} ({cantidad})</span>
        </div>
        <div className="summary-row">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div className="summary-row">
          <span>{t("cart.shipping")}</span>
          <span>$10.000</span>
        </div>
        <div className="summary-total">
          <span>{t("cart.total")}</span>
          <span>{formatCOP(total + 10000)}</span>
        </div>
        <button onClick={handleCheckout} className="checkout-btn">
          {t("cart.buy")}
        </button>
      </div>
    </div>
  );
}

export default Cart;
