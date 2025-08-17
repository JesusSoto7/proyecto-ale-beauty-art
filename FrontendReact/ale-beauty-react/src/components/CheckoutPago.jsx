import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function CheckoutPago() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { orderId, total } = location.state || {};

  if (!publicKey) {
    console.error("No se encontró la clave pública en las variables de entorno");
    return;
  }

  useEffect(() => {
    const mp = new window.MercadoPago(publicKey, {
      locale: "es-CO",
    });

    const bricksBuilder = mp.bricks();
    const renderCardPaymentBrick = async (bricksBuilder) => {
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
                },
                body: JSON.stringify({
                  ...cardFormData,
                  transaction_amount: Number(total),
                  order_id: orderId
                })
              })
                .then((response) => response.json())
                .catch((error) => {
                  // handle error response when trying to create payment
                  reject();
                })
            });
          },
          onError: (error) => {
            // callback called to all error cases related to the Brick
          },
        },
      };
      window.cardPaymentBrickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
    };
    renderCardPaymentBrick(bricksBuilder);
  }, [orderId, total]);

  return (
    <div>
      <h2>Pago con tarjeta</h2>
      <div id="cardPaymentBrick_container" />
    </div>
  );
}
