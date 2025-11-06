import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import { clearCart as guestClearCart } from "../utils/guestCart";
const normalizeToken = (raw) => (raw && raw !== "null" && raw !== "undefined" ? raw : null);
export default function CheckoutSuccess() {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  const location = useLocation();
  const { paymentId, lang } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(location.state?.order);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && paymentId) {
      setLoading(true);
      fetch(`https://localhost:4000/api/v1/orders/by_payment/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("No se encontró la orden.");
          return res.json();
        })
        .then(data => {
          setOrder(data.order);
          setLoading(false);
        })
        .catch(() => {
          setOrder(null);
          setLoading(false);
        });
    } else if (order) {
      setLoading(false);
    }
  }, [order, paymentId]);


  useEffect(() => {
    const tok = normalizeToken(localStorage.getItem("token"));
    if (!tok) {
      try { guestClearCart(); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!order || !order.productos || order.productos.length === 0) return;

    const payload = {
      transaction_id: paymentId || order.id,
      value: order.pago_total || order.total || 0,
      currency: "COP",
      items: order.productos.map((p) => ({
        item_id: p.id?.toString() || "",
        item_name: p.nombre || p.nombre_producto || "",
        price: p.precio || p.precio_producto || 0,
        quantity: p.cantidad || 1,
      }))
    };

    console.log("Enviando purchase GA4:", payload);
    window.gtag && window.gtag("event", "purchase", payload);
  }, [order, paymentId]);

  useEffect(() => {
    if (!publicKey || !paymentId || loading || !order) return;

    const mp = new window.MercadoPago(publicKey, { locale: "es-CO" });
    const bricksBuilder = mp.bricks();

    const renderStatusScreenBrick = async () => {
      const settings = {
        initialization: { paymentId: String(paymentId) },
        customization: {
          visual: {
            hideStatusDetails: true,
            hideTransactionDate: true,
            style: { theme: "default", successColor: "pink", outlineSecondaryColor: "pink" },
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
  }, [publicKey, paymentId, lang, loading, order]);

  if (!paymentId) {
    return <p>{t("checkout.noPaymentFound")}</p>;
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <CircularProgress style={{ color: "#ff4d94" }} />
        <p className="text-pink-500 mt-2" style={{ color: "#ff4d94" }}>
          Cargando...
        </p>
      </div>
    );
  }

  if (!order) {
    return <div style={{padding: 40, textAlign: "center", color: "red"}}>No se pudo cargar la información de la compra.</div>;
  }

  return (
    <div>
      <div id="statusScreenBrick_container"></div>
      {/* Puedes mostrar resumen de compra aquí */}
    </div>
  );
}