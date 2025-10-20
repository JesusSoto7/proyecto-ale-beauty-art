import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatCOP } from "../../services/currency";
import { useNavigate, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import "../../assets/stylesheets/pedidos.css";

function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert(t('orders.notAuthenticated'));
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/my_orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(t('orders.loadError'), err))
      .finally(() => setLoading(false));
  }, [token, t]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'en' ? "en-US" : "es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-pink-600">
        {t('orders.myOrders')}
      </h2>

      {loading || orders.length === 0 ? (
        <div className="text-center py-10">
          <CircularProgress style={{ color: "#ff4d94" }} />
          <p className="text-pink-500 mt-2" style={{color:"#ff4d94"}}>Cargando...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="pedido-card glow-effect"
              style={{ "--glow": "0" }}
            >
              <div className="pedido-row">
                <span className="label">{t('orders.orderNumber')}:</span>
                <span className="value">{order.numero_de_orden}</span>
              </div>

              <div className="pedido-row">
                <span className="label">{t('orders.total')}:</span>
                <span className="value pink">{formatCOP(order.pago_total)}</span>
              </div>

              <div className="pedido-row">
                <span className="label">{t('orders.paymentDate')}:</span>
                <span className="value muted">{formatDate(order.fecha_pago)}</span>
              </div>

              <button
                onClick={() => navigate(`/${lang}/pedidos/${order.id}`)}
                className="pedido-btn"
                onMouseEnter={(e) => {
                  const card = e.currentTarget.closest(".pedido-card");
                  card.style.setProperty("--glow", "1");
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget.closest(".pedido-card");
                  card.style.setProperty("--glow", "0");
                }}
              >
                {t('orders.viewDetails')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pedidos;