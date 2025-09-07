import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CheckoutError() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { paymentId } = location.state || {};
  const { t } = useTranslation();

  if (!publicKey) {
    console.error(t("checkout.noPublicKey"));
    return null;
  }

  if (!paymentId) {
    return <p>{t("checkout.noPaymentFound")}</p>;
  }

  useEffect(() => {
    const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
    const bricksBuilder = mp.bricks();

    const renderStatusScreenBrick = async () => {
      const settings = {
        initialization: {
          paymentId: String(paymentId),
        },
        customization: {
          visual: {
            hideStatusDetails: true,
            hideTransactionDate: true,
            style: {
              theme: "default",
            },
          },
          backUrls: {
            error: "http://localhost:3000/error",
            return: "http://localhost:3000/inicio",
          },
        },
        callbacks: {
          onReady: () => {},
          onError: (error) => {
            console.error("Error en statusScreen:", error);
          },
        },
      };

      window.statusScreenBrickController = await bricksBuilder.create(
        "statusScreen",
        "statusScreenBrick_container",
        settings
      );
    };

    renderStatusScreenBrick();

    return () => {
      if (window.statusScreenBrickController) {
        window.statusScreenBrickController.destroy();
      }
    };
  }, [publicKey, paymentId]);

  return (
    <div>
      <div id="statusScreenBrick_container"></div>
    </div>
  );
}
