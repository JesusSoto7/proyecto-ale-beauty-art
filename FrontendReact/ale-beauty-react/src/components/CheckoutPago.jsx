import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CheckoutPago() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const { orderId, total } = location.state || {};
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert(t("checkout.notAuthenticated"));
  }, []); // solo se ejecuta al montar

  useEffect(() => {
    if (!token || !publicKey) return;

    const initBrick = async () => {
      if (!window.MercadoPago) {
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        document.body.appendChild(script);
        await new Promise((res) => (script.onload = res));
      }

      const mp = new window.MercadoPago(publicKey, { locale: "es-CO" });
      const bricksBuilder = mp.bricks();

      const settings = {
        initialization: { amount: Number(total), payer: { email: "" } },
        customization: { 
          visual: { style: { theme: "default" } }, 
          paymentMethods: { maxInstallments: 1 } 
        },
        callbacks: {
          onReady: () => console.log("Brick listo"),
          onSubmit: async (cardFormData) => {
            try {
              const res = await fetch("https://localhost:4000/api/v1/payments", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...cardFormData,
                  transaction_amount: Number(total),
                  order_id: orderId,
                  lang: lang,
                }),
              });
              const data = await res.json();

              if (data.redirect_url) {
                window.location.href = data.redirect_url;
              } else {
                alert(t("checkout.noRedirect"));
              }
            } catch (err) {
              console.error("Error al procesar el pago:", err);
              throw err;
            }
          },
          onError: (err) => console.error("Error en el Brick:", err),
        },
      };

      if (document.getElementById("cardPaymentBrick_container")) {
        window.paymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          settings
        );
      }
    };

    initBrick();

    return () => {
      window.paymentBrickController?.destroy();
    };
  }, [token, publicKey, orderId, total, navigate, lang, t]);

  return (
    <div>
      <h2>{t("checkout.cardPayment")}</h2>
      <div id="cardPaymentBrick_container" />
    </div>
  );
}
