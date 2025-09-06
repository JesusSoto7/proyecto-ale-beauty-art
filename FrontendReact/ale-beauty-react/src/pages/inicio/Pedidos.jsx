// src/pages/inicio/Pedidos.jsx
import { useEffect, useState } from "react";
import { formatCOP } from "../../services/currency";
import { useNavigate } from "react-router-dom";

function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("No estás autenticado");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/my_orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error cargando pedidos:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-pink-600">Mis Pedidos</h2>

      {loading ? (
        <p className="text-gray-500">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No tienes pedidos pagados todavía.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium text-gray-700">N° de Orden:</span>
                <span className="font-semibold text-gray-900">{order.numero_de_orden}</span>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="font-semibold text-pink-600">{formatCOP(order.pago_total)}</span>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium text-gray-700">Fecha de pago:</span>
                <span className="text-gray-500">{formatDate(order.fecha_pago)}</span>
              </div>

              <button
                onClick={() => navigate(`/es/pedidos/${order.id}`)}
                className="mt-2 w-full bg-pink-600 text-white text-sm py-1.5 rounded hover:bg-pink-700 transition-colors"
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Pedidos;

