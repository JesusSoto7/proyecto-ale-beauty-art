import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CheckoutSuccess() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { paymentId, lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    if (!publicKey || !paymentId) return;

    const mp = new window.MercadoPago(publicKey, {
      locale: "es-CO",
    });

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
              successColor: "pink",
              outlineSecondaryColor: "pink",
            },
          },
          backUrls: {
            error: "https://localhost:3000/inicio",
            return: `https://localhost:3000/${lang}/inicio`,
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

    setTimeout(renderStatusScreenBrick, 0);

    return () => {
      if (window.statusScreenBrickController) {
        window.statusScreenBrickController.destroy();
      }
    };
  }, [publicKey, paymentId, lang]);

  if (!paymentId) {
    return <p>{t("checkout.noPaymentFound")}</p>;
  }

  return (
    <div>
      <div id="statusScreenBrick_container"></div>
    </div>
  );
}
