import { useState, useEffect } from "react"

function CheckoutShippingAddress() {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no esta atenticado");
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/shipping_addresses/predeterminada", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error al cargar la direccion: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setAddress(data);
      })
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div>
      <h2>Mis direcciones</h2>

      <ul className="address-list">
        {address ? (
          <div className="address-info">
            <strong>{address.nombre} {address.apellido}</strong>
            <br />
            {address.direccion} — Barrio: {address.neighborhood.nombre}
          </div>


        ) : (
          <p>No tienes dirección predeterminada.</p>
        )}
      </ul>
    </div>

  );

}

export default CheckoutShippingAddress