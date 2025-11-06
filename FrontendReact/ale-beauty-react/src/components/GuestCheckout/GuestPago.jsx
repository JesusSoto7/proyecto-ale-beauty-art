import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearCart as guestClearCart } from "../../utils/guestCart";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
const normalizeToken = (raw) => (raw && raw !== "null" && raw !== "undefined" ? raw : null);

export default function GuestPago({ order, guestCart, address }) {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();
  const triedRef = useRef(false); // reintento una sola vez

  useEffect(() => {
    const amount = Number(order?.total);
    const shouldInit = !!(publicKey && order?.id && amount > 0);
    if (!shouldInit) {
      console.warn("MP Brick: faltan datos para iniciar", { publicKey, orderId: order?.id, amount });
      try { window.paymentBrickController?.destroy(); } catch {}
      window.paymentBrickController = null;
      return;
    }

    let destroyed = false;
    let ready = false;
    let timeoutId;

    // Garantiza script SDK cargado una sola vez
    if (!window.__mpSdkPromise) {
      window.__mpSdkPromise = new Promise((resolve, reject) => {
        if (window.MercadoPago) return resolve();
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    }

    const init = async () => {
      try {
        console.debug("MP Brick init: publicKey/monto", { publicKey, amount });
        await window.__mpSdkPromise;
        if (destroyed) return;
        await new Promise(requestAnimationFrame);
        if (destroyed) return;

        const containerId = "guestCardPayment_container";
        const containerEl = document.getElementById(containerId);
        if (!containerEl) {
          console.error("MP Brick: contenedor no encontrado", containerId);
          return;
        }

        // Asegura altura mínima para evitar colapsos visuales
        containerEl.style.minHeight = "380px";

        // Limpia instancias previas
        if (window.paymentBrickController) {
          try { await window.paymentBrickController.destroy(); } catch {}
          window.paymentBrickController = null;
        }

        const mp = new window.MercadoPago(publicKey, { locale: "es-CO" });
        const bricksBuilder = mp.bricks();

        // Activar timeout de seguridad: si no dispara onReady, reintenta una vez
        timeoutId = setTimeout(async () => {
          if (!ready && !destroyed && !triedRef.current) {
            console.warn("MP Brick: onReady no llegó, reintentando montaje…");
            triedRef.current = true;
            try { await window.paymentBrickController?.destroy(); } catch {}
            window.paymentBrickController = null;
            init(); // reintento
          }
        }, 4000);

        window.paymentBrickController = await bricksBuilder.create("cardPayment", containerId, {
          initialization: { amount, payer: { email: "" } },
          customization: {
            visual: { style: { theme: "default" } },
            paymentMethods: { maxInstallments: 1 }
          },
          callbacks: {
            onReady: () => {
              ready = true;
              console.debug("MP Brick: onReady");
              if (timeoutId) clearTimeout(timeoutId);
            },
            onSubmit: async (cardFormData) => {
              const payload = {
                ...cardFormData,
                transaction_amount: amount,
                order_id: order.id,
                payer: {
                  email: cardFormData?.payer?.email || "",
                  identification: cardFormData?.payer?.identification,
                },
                // Overrides para el mailer (no se guardan en BD)
                buyer_name: address?.name || "",
                buyer_phone: address?.phone || "",
                buyer_address: address?.address || "",
              };
              const res = await fetch(`${API_BASE}/api/v1/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json();

              if (res.ok) {
                const tok = normalizeToken(localStorage.getItem("token"));
                if (data.clear_guest_cart || !tok) {
                  try { guestClearCart(); } catch {}
                }
                setTimeout(() => {
                  const paymentId = data.id || data.payment_id || "";
                  navigate(`/${lang}/checkout/success/${paymentId}`, {
                    state: { order: { id: order.id, pago_total: order.total, productos: guestCart?.products || [] } },
                  });
                }, 0);
              } else {
                alert(data?.error || "Pago rechazado");
              }
            },
            onError: (err) => {
              console.error("Error en MP Brick:", err);
              if (timeoutId) clearTimeout(timeoutId);
            },
          },
        });
      } catch (e) {
        console.error("Error inicializando MP:", e);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (timeoutId) clearTimeout(timeoutId);
      try { window.paymentBrickController?.destroy(); } catch {}
      window.paymentBrickController = null;
    };
  }, [publicKey, order, guestCart, navigate, lang, t, address]);

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