import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";


export default function CheckoutSuccess() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { paymentId } = useParams();


  useEffect(() => {
    if (!publicKey || !paymentId) return;

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-CO",
    });


    const bricksBuilder = mp.bricks();
    const renderStatusScreenBrick = async () => {
      const settings = {
        initialization: {
          paymentId: String(paymentId),  // Payment identifier, from which the status will be checked
        },
        customization: {
          visual: {
            hideStatusDetails: true,
            hideTransactionDate: true,
            style: {
              theme: 'default', // 'default' | 'dark' | 'bootstrap' | 'flat'
              successColor: "pink",
              outlineSecondaryColor: "pink"
            },
          },
          backUrls: {
            'error': 'https://localhost:3000/inicio',
            'return': 'https://localhost:3000/inicio'
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

      await bricksBuilder.create('statusScreen', 'statusScreenBrick_container', settings);
    };

    setTimeout(renderStatusScreenBrick, 0);

    return () => {
      if (window.statusScreenBrickController) {
        window.statusScreenBrickController.destroy();
      }
    };

  }, [publicKey, paymentId]);
  if (!paymentId) {
    return <p>No se encontró información del pago</p>;
  }
  return (
    <div>
      <div id="statusScreenBrick_container"></div>
    </div>
  );
}