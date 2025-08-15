import React, { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm"; // tu componente formulario
import { useNavigate } from "react-router-dom";


function ShippingAddresses() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [addresses, setAddresses] = useState(null); // null = no cargado aún
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no estas autenticado");
    }
  }, []);
  // Cargar direcciones al inicio
  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/shipping_addresses", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error al cargar direcciones: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Direcciones recibidas:", data);
        setAddresses(data);
        if (data.length === 0) {
          setShowForm(true);
        }
      })
      .catch(error => {
        console.error(error);
        setAddresses([]);  // para evitar estado null infinito
        setShowForm(true);
      });
  }, [token]);

  const handleFormSuccess = (savedAddress, isEditing) => {
    if (isEditing) {
      // Si era edición, actualizamos la lista
      setAddresses(prev =>
        prev.map(addr => (addr.id === savedAddress.id ? savedAddress : addr))
      );
    } else {
      // Si era creación, agregamos
      setAddresses(prev => [...prev, savedAddress]);
    }
    setShowForm(false);
    setEditAddress(null);
  };

  if (addresses === null) {
    return <p>Cargando direcciones...</p>;
  }
  return (
    <div>
      {showForm ? (
        <div>
          <h2>Crear nueva dirección</h2>
          <ShippingAddressForm
            token={token}
            onSuccess={handleFormSuccess}
            initialData={editAddress}
          />
          <button onClick={() => {
            setShowForm(false);
            setEditAddress(null);
          }}
          >Cancelar</button>
        </div>
      ) : (
        <div>
          <h2>Mis direcciones</h2>
          {addresses.length === 0 ? (
            <p>No tienes direcciones guardadas.</p>
          ) : (
            <ul>
              {addresses.map(addr => (
                <li key={addr.id}>
                  {addr.nombre} {addr.apellido} — {addr.direccion} — Barrio: {addr.neighborhood.nombre}
                  {/* Muestra más info si quieres */}
                  <button
                    onClick={() => {
                      setEditAddress(addr);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => navigate("/direcciones/nueva")}>Agregar nueva dirección</button>
        </div>
      )}
    </div>
  );
}

export default ShippingAddresses;
