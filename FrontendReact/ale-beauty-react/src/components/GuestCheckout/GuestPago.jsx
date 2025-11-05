import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearCart as guestClearCart } from "../../utils/guestCart";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";

export default function GuestPago({ order, guestCart }) {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const shouldInit = !!(publicKey && order?.id && order?.total);
    if (!shouldInit) {
      try { window.paymentBrickController?.destroy(); } catch {}
      window.paymentBrickController = null;
      return;
    }
    let destroyed = false;

    if (!window.__mpSdkPromise) {
      window.__mpSdkPromise = new Promise((resolve, reject) => {
        if (window.MercadoPago) return resolve();
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    const init = async () => {
      try {
        await window.__mpSdkPromise;
        if (destroyed) return;
        await new Promise(requestAnimationFrame);
        if (destroyed) return;

        const containerId = "guestCardPayment_container";
        const containerEl = document.getElementById(containerId);
        if (!containerEl) return;

        if (window.paymentBrickController) {
          try { await window.paymentBrickController.destroy(); } catch {}
          window.paymentBrickController = null;
        }

        const mp = new window.MercadoPago(publicKey, { locale: "es-CO" });
        const bricksBuilder = mp.bricks();

        window.paymentBrickController = await bricksBuilder.create("cardPayment", containerId, {
          initialization: { amount: Number(order.total), payer: { email: "" } },
          customization: { visual: { style: { theme: "default" } }, paymentMethods: { maxInstallments: 1 } },
          callbacks: {
            onReady: () => {},
            onSubmit: async (cardFormData) => {
              const payload = {
                ...cardFormData,
                transaction_amount: Number(order.total),
                order_id: order.id,
                payer: {
                  email: cardFormData?.payer?.email || "",
                  identification: cardFormData?.payer?.identification,
                },
              };
              const res = await fetch(`${API_BASE}/api/v1/payments/mobile_create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              console.debug("mobile_create response:", data);

              if (res.ok) {
                // Limpia carrito en invitado: usa bandera o ausencia de token
                const tok = localStorage.getItem("token");
                if (data.clear_guest_cart || !tok) {
                  try { guestClearCart(); } catch {}
                }
                // Da un tick para que los listeners actualicen el header
                setTimeout(() => {
                  navigate(`/${lang}/checkout/success/${data.id}`, {
                    state: { order: { id: order.id, pago_total: order.total, productos: guestCart?.products || [] } },
                  });
                }, 0);
              } else {
                alert(data?.error || "Pago rechazado");
              }
            },
            onError: (err) => console.error("Error en MP Brick:", err),
          },
        });
      } catch (e) {
        console.error("Error inicializando MP:", e);
      }
    };

    init();
    return () => {
      destroyed = true;
      try { window.paymentBrickController?.destroy(); } catch {}
      window.paymentBrickController = null;
    };
  }, [publicKey, order, guestCart, navigate, lang, t]);

  return (
    <div>
      <h2>{t("checkout.paymentStep")}</h2>
      <section style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>{t("checkout.cardPayment") || "Pago con tarjeta"}</h3>
        <div id="guestCardPayment_container" />
      </section>
    </div>
  );
}