import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function CheckoutError() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { paymentId } = location.state || {};


  if (!publicKey) {
    console.error("No se encontró la clave pública en las variables de entorno");
    return;
  }

  if (!paymentId) {
    return <p>No se encontró información del pago</p>;
  }


  const mp = new MercadoPago(publicKey, { // Add your public key credential
    locale: 'es-AR'
  });
  const bricksBuilder = mp.bricks();
  const renderStatusScreenBrick = async (bricksBuilder) => {
    const settings = {
      initialization: {
        paymentId: String(paymentId), // Payment identifier, from which the status will be checked
      },
      customization: {
        visual: {
          hideStatusDetails: true,
          hideTransactionDate: true,
          style: {
            theme: 'default', // 'default' | 'dark' | 'bootstrap' | 'flat'
          },
        },
        backUrls: {
          'error': '<http://<your domain>/error>',
          'return': '<http://<your domain>/homepage>'
        }
      },
      callbacks: {
        onReady: () => {
          // Callback called when Brick is ready
        },
        onError: (error) => {
          // Callback called for all Brick error cases
        },
      },
    };
    window.statusScreenBrickController = await bricksBuilder.create('statusScreen', 'statusScreenBrick_container', settings);
  };
  renderStatusScreenBrick(bricksBuilder);

  return (
    <div>
      <div id="statusScreenBrick_container"></div>
    </div>
  )
}