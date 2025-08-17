import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://localhost:4000/api/v1/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
      })
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
      .then((data) => {
        if (data) {
          setCart(data.cart);
        }
      })
      .catch((err) => {
        console.error("Error actualizando carrito: ", err);
        alert("Error actualizando carrito");
      });
  };

  if (!cart || !cart.products || cart.products.length === 0) {
    return <p className="empty-cart">El carrito está vacío.</p>;
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
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          navigate("/checkout/payments", {
            state: {
              orderId: data.order.id,
              total: data.order.pago_total
            }
          });
        } else {
          alert("No se pudo crear la orden");
        }
      })
      .catch((err) => {
        console.error("Error creando orden:", err);
        alert("Error creando orden");
      })
  }


  return (
    <div className="cart-container">
      <div className="cart-table">
        <h1>Tu carrito de compras</h1>
        {cart.products.map((product) => (
          <div className="cart-row" key={product.product_id}>
            <div className="cart-product">
              <img src={product.imagen_url} alt={product.nombre_producto} />
              <div>
                <h4>{product.nombre_producto}</h4>
                <p>Set: {product.color || "N/A"}</p>
              </div>
            </div>
            <div className="cart-quantity">
              <button onClick={() => updateQuantity(product.product_id, true)}>
                +
              </button>
              <span>{product.cantidad}</span>
              <button onClick={() => updateQuantity(product.product_id, false)}>
                -
              </button>
            </div>
            <div className="cart-price">
              ${(product.precio_producto * product.cantidad).toFixed(2)}
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
        <h4>Resumen de compra</h4>
        <div className="summary-row">
          <span>productos({cantidad})</span>
        </div>
        <div className="summary-row">
          <span>Sub Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Envio</span>
          <span>$10.000</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>
            ${(total - total * 0.1 + 50).toFixed(2)}
          </span>
        </div>
        <button onClick={handleCheckout}
          className="checkout-btn">Comprar</button>
      </div>
    </div>
  );
}

export default Cart;
