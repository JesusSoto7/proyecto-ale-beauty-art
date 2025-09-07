import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { formatCOP } from "../../services/currency";
import "../../assets/stylesheets/DetallePedido.css";
import noImage from "../../assets/images/no_image.png";

function DetallePedido() {
  const { id, lang } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError(t('orderDetail.notAuthenticated'));
      setLoading(false);
      return;
    }

    fetch(`https://localhost:4000/api/v1/my_orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${t('orderDetail.error')} ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPedido(data.order ? data.order : data);
      })
      .catch((err) => {
        console.error(t('orderDetail.loadError'), err);
        setError(t('orderDetail.loadFailed'));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) return <p className="text-gray-500">{t('orderDetail.loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!pedido) return <p className="text-red-500">{t('orderDetail.notFound')}</p>;

  // Calcular totales
  const subTotal = (pedido.productos || []).reduce((acc, p) => {
    const cantidad = Number(p.cantidad || 0);
    const precio = Number(p.precio_unitario || p.precio_producto || 0);
    return acc + cantidad * precio;
  }, 0);

  const envio = pedido.envio || 10000;
  const total = subTotal + envio;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(lang === 'en' ? "en-US" : "es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="detalle-container">
      <h2 className="detalle-title">{t('orderDetail.title')}</h2>

      <div className="detalle-header">
        <p>
          <strong>{t('orderDetail.orderNumber')}:</strong> {pedido.numero_de_orden ?? pedido.id}
        </p>
        <p>
          <strong>{t('orderDetail.paymentDate')}:</strong> {formatDate(pedido.fecha_pago)}
        </p>
      </div>

      {/* Lista de productos */}
      <div className="detalle-lista">
        {(pedido.productos || []).map((p) => {
          const cantidad = p.cantidad;
          const precio = p.precio_unitario || p.precio_producto;
          const nombre = p.nombre_producto || (p.product?.nombre_producto ?? t('orderDetail.product'));
          const imagen = p.imagen_url || (p.product?.imagen_url ?? noImage);
          const slug = p.slug || p.product?.slug; 

          return (
            <Link
              key={p.id}
              to={`/${lang || "es"}/producto/${slug}`}
              className="detalle-item"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={imagen}
                alt={nombre}
                onError={(e) => (e.currentTarget.src = noImage)}
                className="detalle-img"
              />
              <div className="detalle-info">
                <span className="detalle-nombre">{nombre}</span>
                <span>{t('orderDetail.quantity')}: {cantidad}</span>
                <span className="detalle-subtotal">
                  {formatCOP(precio * cantidad)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <hr />

      {/* Totales */}
      <div className="detalle-totales">
        <p>
          <strong>{t('orderDetail.subtotal')}:</strong> {formatCOP(subTotal)}
        </p>
        <p>
          <strong>{t('orderDetail.shipping')}:</strong> {formatCOP(envio)}
        </p>
        <h3 className="detalle-total" style={{ color: "#d95d85" }}>
          <strong>{t('orderDetail.total')}:</strong> {formatCOP(total)}
        </h3>
      </div>
    </div>
  );
}

export default DetallePedido;