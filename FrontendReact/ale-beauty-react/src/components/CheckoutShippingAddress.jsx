import { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm";
import EditIcon from "@mui/icons-material/Edit";

function CheckoutShippingAddress() {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // 👈 Nuevo estado

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
          if (res.status === 404) return null;
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

      {address && !isEditing ? (
        <div className="address-info">
          <div>
            <strong>
              {address.nombre} {address.apellido}
            </strong>
            <br />
            {address.direccion} — Barrio: {address.neighborhood?.nombre}
            <br />
          </div>
          
          <button id="editBtn" onClick={() => setIsEditing(true)}><EditIcon fontSize="small" /></button>
        </div>
      ) : (
        <div>
          <p>{address ? "Edita tu dirección:" : "No tienes dirección guardada, agrega una:"}</p>
          <ShippingAddressForm
            initialData={address}
            onSuccess={(newAddress) => {
              setAddress(newAddress);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

export default CheckoutShippingAddress;
