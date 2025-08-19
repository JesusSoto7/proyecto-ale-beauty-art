import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CheckoutPago() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const { orderId, total } = location.state || {};

  if (!publicKey) {
    console.error("No se encontró la clave pública en las variables de entorno");
    return;
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no esta atenticado");
    }
  })

  useEffect(() => {
    if (!token) return;

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-CO",
    });

    const bricksBuilder = mp.bricks();
    let controller;

    const renderCardPaymentBrick = async () => {
      const settings = {
        initialization: {
          amount: Number(total), // total amount to be paid
          payer: {
            email: "",
          },
        },
        customization: {
          visual: {
            style: {
              theme: 'default', // | 'dark' | 'bootstrap' | 'flat'
              customVariables: {
              },
            },
          },
          paymentMethods: {
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => {
            // callback called when the Brick is ready
          },
          onSubmit: (cardFormData) => {
            //  callback called when the user clicks on the submit data button
            //  example of sending the data collected by our Brick to your server
            return new Promise((resolve, reject) => {
              fetch("https://localhost:4000/api/v1/payments", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  ...cardFormData,
                  transaction_amount: Number(total),
                  order_id: orderId
                })
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Respuesta del backend:", data);
                  navigate(`/checkout/success/${data.payment.id}`, { state: { paymentId: data.payment.id } });
                  resolve();
                })
                .catch((error) => {
                  console.error("Error al procesar el pago:", error);
                  reject();
                })
            });
          },
          onError: (error) => {
            console.error("Error en el Brick:", error);
          },
        },
      };
      controller = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
    };
    renderCardPaymentBrick();

    return () => {
      if (controller) {
        controller.destroy();
      }
    }

  }, [orderId, total, publicKey, navigate, token]);

  return (
    <div>
      <h2>Pago con tarjeta</h2>
      <div id="cardPaymentBrick_container" />
    </div>
  );
}
