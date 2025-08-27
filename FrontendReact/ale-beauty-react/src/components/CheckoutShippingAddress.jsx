import { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm";

function CheckoutShippingAddress() {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("No está autenticado");
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/shipping_addresses/predeterminada", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) return null; // no hay dirección
          throw new Error(`Error al cargar la dirección: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAddress(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p>Cargando dirección...</p>;

  return (
    <div>
      <h2>Mi dirección de envío</h2>

      {address ? (
        <div className="address-info">
          <strong>
            {address.nombre} {address.apellido}
          </strong>
          <br />
          {address.direccion} — Barrio: {address.neighborhood?.nombre}
        </div>
      ) : (
        <div>
          <p>No tienes dirección guardada, agrega una:</p>
          <ShippingAddressForm
            onSuccess={(newAddress) => setAddress(newAddress)} // 👈 No redirige
          />
        </div>
      )}
    </div>
  );
}

export default CheckoutShippingAddress;
