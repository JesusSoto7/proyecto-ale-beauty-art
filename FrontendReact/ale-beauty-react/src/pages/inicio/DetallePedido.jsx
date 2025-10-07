import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatCOP } from "../../services/currency";
import "../../assets/stylesheets/DetallePedido.css";
import noImage from "../../assets/images/no_image.png";

export default function DetallePedido() {
  const { id, lang } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t("orderDetail.notAuthenticated"));
      setLoading(false);
      return;
    }

    fetch(`https://localhost:4000/api/v1/my_orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${t("orderDetail.error")} ${res.status}`);
        return res.json();
      })
      .then((data) => setPedido(data.order ? data.order : data))
      .catch(() => setError(t("orderDetail.loadFailed")))
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) return <p className="text-gray-500">{t("orderDetail.loading")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!pedido) return <p className="text-red-500">{t("orderDetail.notFound")}</p>;

  const subTotal = (pedido.productos || []).reduce((acc, p) => {
    const cantidad = Number(p.cantidad || 0);
    const precio = Number(p.precio_unitario || p.precio_producto || 0);
    return acc + cantidad * precio;
  }, 0);

  const envio = pedido.envio || 10000;
  const total = subTotal + envio;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(
      lang === "en" ? "en-US" : "es-CO",
      { day: "2-digit", month: "2-digit", year: "numeric" }
    );
  };

  return (
    <div className="pedido-container">
      {/* Encabezado */}
      <div className="pedido-header">
        <h2>{t("orderDetail.title")}</h2>
        <p>
          <strong>{t("orderDetail.orderNumber")}:</strong>{" "}
          {pedido.numero_de_orden ?? pedido.id}
        </p>
        <p>
          <strong>{t("Estado")}:</strong>{" "}
          <span className="pedido-status">{pedido.status?.toUpperCase()}</span>
        </p>
      </div>

      {/* Sección superior con info de pago y dirección */}
      <div className="pedido-info-grid">
        <div className="pedido-card">
          <h3>{t("Direccion de envio")}</h3>
          <p>
            {pedido.direccion_envio ||
              t("orderDetail.noShippingAddress") ||
              "No disponible"}
          </p>
        </div>

        <div className="pedido-card">
          <h3>{t("Metodo de pago")}</h3>
          {(pedido.tarjeta_tipo || pedido.tarjeta_ultimos4) ? (
            <p className="pedido-card-info">
              {pedido.tarjeta_tipo?.toUpperCase() || "Tarjeta"}
              <br />
              <span className="pedido-card-dots">••••</span>{" "}
              {pedido.tarjeta_ultimos4 || "XXXX"}
            </p>
          ) : (
            <p>{t("orderDetail.noPaymentInfo") || "No disponible"}</p>
          )}
        </div>

        <div className="pedido-card">
          <h3>{t("orderDetail.paymentDate")}</h3>
          <p>{formatDate(pedido.fecha_pago)}</p>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="pedido-products">
        <h3>{t("Productos adquiridos")}</h3>
        {(pedido.productos || []).map((p) => {
          const cantidad = p.cantidad;
          const precio = p.precio_unitario || p.precio_producto;
          const nombre =
            p.nombre_producto ||
            p.product?.nombre_producto ||
            t("orderDetail.product");
          const imagen = p.imagen_url || p.product?.imagen_url || noImage;
          const slug = p.slug || p.product?.slug;

          return (
            <Link
              key={p.id}
              to={`/${lang || "es"}/producto/${slug}`}
              className="pedido-item"
            >
              <img
                src={imagen}
                alt={nombre}
                onError={(e) => (e.currentTarget.src = noImage)}
              />
              <div className="pedido-item-info">
                <span className="pedido-item-name">{nombre}</span>
                <span>
                  {t("orderDetail.quantity")}: {cantidad}
                </span>
              </div>
              <div className="pedido-item-price">
                {formatCOP(precio * cantidad)}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Totales */}
      <div className="pedido-summary">
        <div className="pedido-summary-row">
          <span>{t("orderDetail.subtotal")}:</span>
          <strong>{formatCOP(subTotal)}</strong>
        </div>
        <div className="pedido-summary-row">
          <span>{t("orderDetail.shipping")}:</span>
          <strong>{formatCOP(envio)}</strong>
        </div>
        <div className="pedido-summary-total">
          <span>{t("orderDetail.total")}:</span>
          <strong>{formatCOP(total)}</strong>
        </div>
      </div>
    </div>
  );
}
