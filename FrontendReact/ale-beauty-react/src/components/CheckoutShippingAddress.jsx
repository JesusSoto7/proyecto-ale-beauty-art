import { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm";
import EditIcon from "@mui/icons-material/Edit";
import { Button } from "@mui/material";

function CheckoutShippingAddress({ onAddressSelected }) {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
        onAddressSelected(!!data);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        onAddressSelected(false);
      });
  }, [token, onAddressSelected]);

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

          <button
            id="editBtn"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            <EditIcon fontSize="small" />
          </button>
        </div>
      ) : (
        <div>
          <ShippingAddressForm
            initialData={address}
            onSuccess={(newAddress) => {
              setAddress(newAddress);
              setIsEditing(false);
              onAddressSelected(true);
            }}
            onCancel={() => {
              setIsEditing(false);
              onAddressSelected(!!address);
            }}
            variant="checkout"
          />

          {address && (
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                onAddressSelected(!!address);
              }}
              variant="checkout"
              color="secondary"
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckoutShippingAddress;
