import React, { useState, useEffect } from "react";
import { pink } from '@mui/material/colors';
import Checkbox from '@mui/material/Checkbox';
import ShippingAddressForm from "./ShippingAddressForm";
import { useNavigate, useParams } from "react-router-dom";
import '../assets/stylesheets/ShippingAddresses.css'
import FormControlLabel from "@mui/material/FormControlLabel";

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };





function ShippingAddresses() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [addresses, setAddresses] = useState(null); // null = no cargado aún
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { lang } = useParams();



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

  const handleSetPredeterminada = async (id) => {

    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id
          ? { ...addr, predeterminada: true }
          : { ...addr, predeterminada: false }
      )
    );

    try {
      const res = await fetch(`https://localhost:4000/api/v1/shipping_addresses/${id}/set_predeterminada`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al actualizar predeterminada");

    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar la direccion predeterminada");


      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === id
            ? { ...addr, predeterminada: false }
            : addr
        )
      );
    }
  }


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
    <div className="shipping-container">
      {showForm ? (
        <div>
          <h2>Crear nueva dirección</h2>
          <ShippingAddressForm
            token={token}
            onSuccess={handleFormSuccess}
            initialData={editAddress}
            variant="default" 
          />
          <button
            className="btn btn-cancel"
            onClick={() => {
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
            <ul className="address-list">
              {addresses.map(addr => (
                <li key={addr.id} className="address-card">
                  <div className="address-info">
                    <strong>{addr.nombre} {addr.apellido}</strong>
                    <br />
                    {addr.direccion} — Barrio: {addr.neighborhood.nombre}
                  </div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...label}
                        checked={addr.predeterminada}
                        onChange={() => handleSetPredeterminada(addr.id)}
                        sx={{
                          color: pink[800],
                          '&.Mui-checked': {
                            color: pink[600],
                          },
                        }}
                      />
                    }
                    label="Predeterminada"
                  />

                  <div className="button-group">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditAddress(addr);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>

                  </div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => navigate(`/${lang}/direcciones/nueva`)}>Agregar nueva dirección</button>
        </div>
      )}
    </div>
  );
}

export default ShippingAddresses;
