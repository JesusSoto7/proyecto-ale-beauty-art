import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPaymentMethods, setOrderPaymentMethod } from "./../services/paymentMethod";

export default function CheckoutPago() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://localhost:4000";
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const { orderId, total } = location.state || {};
  const { lang } = useParams();
  const { t } = useTranslation();

  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [settingPM, setSettingPM] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert(t("checkout.notAuthenticated"));
  }, [t]);

  // Cargar métodos de pago activos y auto-seleccionar si solo hay uno
  useEffect(() => {
    if (!token || !orderId) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingMethods(true);
        const list = await getPaymentMethods({ token, baseUrl: API_BASE });
        if (cancelled) return;
        setMethods(list || []);
        if (list?.length === 1) {
          // Auto seleccionar y enviar al backend
          setSettingPM(true);
          await setOrderPaymentMethod({
            token,
            baseUrl: API_BASE,
            orderId,
            codigo: list[0].codigo,
          });
          if (cancelled) return;
          setSelectedMethod(list[0]);
        }
      } catch (e) {
        console.error(e);
        alert(t("checkout.paymentMethodsLoadError") || "No se pudieron cargar los métodos de pago");
      } finally {
        if (!cancelled) setLoadingMethods(false);
        setSettingPM(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [token, orderId, API_BASE, t]);

  // Inicializar Brick de Mercado Pago cuando corresponda
  useEffect(() => {
    const shouldInitMP = !!(token && publicKey && orderId && total && selectedMethod?.codigo === "mercadopago");
    if (!shouldInitMP) {
      // Si cambio de método o salgo, destruyo cualquier instancia previa
      try { window.paymentBrickController?.destroy(); } catch {}
      window.paymentBrickController = null;
      return;
    }

    let destroyed = false;

    const initBrick = async () => {
     
      if (!window.__mpSdkPromise) {
        window.__mpSdkPromise = new Promise((resolve, reject) => {
          if (window.MercadoPago) return resolve();
          const script = document.createElement("script");
          script.src = "https://sdk.mercadopago.com/js/v2";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        });
      }

      try {
        await window.__mpSdkPromise;
      } catch (e) {
        console.error("Error cargando SDK de Mercado Pago:", e);
        return;
      }
      if (destroyed) return;

      // 2) Esperar un frame de render y revalidar contenedor
      await new Promise(requestAnimationFrame);
      if (destroyed) return;

      const containerId = "cardPaymentBrick_container";
      const containerEl = document.getElementById(containerId);
      if (!containerEl) {
        // Evitar el error: no crear si no existe el contenedor
        return;
      }

      // 3) Destruir instancia previa si existe (idempotencia)
      if (window.paymentBrickController) {
        try { await window.paymentBrickController.destroy(); } catch {}
        window.paymentBrickController = null;
      }

      try {
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
                const res = await fetch(`${API_BASE}/api/v1/payments`, {
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

        // 4) Crear el Brick solo si el contenedor sigue existiendo
        if (document.getElementById(containerId)) {
          window.paymentBrickController = await bricksBuilder.create(
            "cardPayment",
            containerId,
            settings
          );
        }
      } catch (e) {
        if (!destroyed) console.error("Error creando CardPayment Brick:", e);
      }
    };

    initBrick();

    return () => {
      destroyed = true;
      if (window.paymentBrickController) {
        window.paymentBrickController.destroy().catch(() => {});
        window.paymentBrickController = null;
      }
    };
  }, [token, publicKey, orderId, total, navigate, lang, t, selectedMethod, API_BASE]);

  const handleSelect = async (m) => {
    if (!token || !orderId) return;
    try {
      setSettingPM(true);
      await setOrderPaymentMethod({
        token,
        baseUrl: API_BASE,
        orderId,
        codigo: m.codigo,
      });
      setSelectedMethod(m);
    } catch (e) {
      console.error(e);
      alert(t("checkout.setPaymentMethodError") || "No se pudo asignar el método de pago");
    } finally {
      setSettingPM(false);
    }
  };

  return (
    <div>
      <h2>{t("checkout.paymentStep")}</h2>

      {/* Selector de método de pago */}
      <section style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>{t("checkout.choosePaymentMethod") || "Elige tu método de pago"}</h3>

        {loadingMethods ? (
          <p>{t("checkout.loadingPaymentMethods") || "Cargando métodos..."}</p>
        ) : methods.length === 0 ? (
          <p style={{ color: "#b00020" }}>
            {t("checkout.noPaymentMethods") || "No hay métodos de pago activos. Contacta al administrador."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {methods.map((m) => (
              <label key={m.codigo} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="payment_method"
                  value={m.codigo}
                  checked={selectedMethod?.codigo === m.codigo}
                  onChange={() => handleSelect(m)}
                  disabled={settingPM}
                />
                <span>{m.nombre_metodo}</span>
                {m.codigo === "mercadopago" && <span style={{ fontSize: 12, color: "#888" }}>Tarjeta con Mercado Pago</span>}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Brick de Mercado Pago solo si el método es mercadopago */}
      {selectedMethod?.codigo === "mercadopago" ? (
        <>
          <h4>{t("checkout.cardPayment")}</h4>
          <div id="cardPaymentBrick_container" />
        </>
      ) : (
        methods.length > 0 && (
          <p style={{ color: "#555" }}>
            {t("checkout.selectMethodToContinue") || "Selecciona un método de pago para continuar."}
          </p>
        )
      )}
    </div>
  );
}