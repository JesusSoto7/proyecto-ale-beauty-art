import { useEffect, useState } from "react";
import { formatCOP } from "../../services/currency";

function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no estas autenticado");
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/my_orders", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error cargando pedidos:", err));
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Mis pedidos</h2>
      {orders.length === 0 ? (
        <p>No tienes pedidos pagados todavía.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border rounded-lg p-4 shadow">
              <p><strong>N° de Orden:</strong> {order.numero_de_orden}</p>
              <p><strong>Total:</strong> {formatCOP(order.pago_total)}</p>
              <p><strong>Fecha de pago:</strong> {order.fecha_pago}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Pedidos;
