import React, { useState, useEffect } from "react";
import { pink } from '@mui/material/colors';
import Checkbox from '@mui/material/Checkbox';
import ShippingAddressForm from "./ShippingAddressForm";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import '../assets/stylesheets/ShippingAddresses.css'
import FormControlLabel from "@mui/material/FormControlLabel";

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

function ShippingAddresses() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const { lang } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert(t('shippingAddresses.notAuthenticated'));
    }
  }, [t]);

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
          throw new Error(t('shippingAddresses.loadError'));
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
        setAddresses([]);
        setShowForm(true);
      });
  }, [token, t]);

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

      if (!res.ok) throw new Error(t('shippingAddresses.updateError'));

    } catch (error) {
      console.error(error);
      alert(t('shippingAddresses.updateFailed'));

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
      setAddresses(prev =>
        prev.map(addr => (addr.id === savedAddress.id ? savedAddress : addr))
      );
    } else {
      setAddresses(prev => [...prev, savedAddress]);
    }
    setShowForm(false);
    setEditAddress(null);
  };

  if (addresses === null) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        gap: "16px"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #ff4d94",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="shipping-container">
      {showForm ? (
        <div>
          <h2>{editAddress ? t('shippingAddresses.editAddress') : t('shippingAddresses.createAddress')}</h2>
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
          >
            {t('shippingAddresses.cancel')}
          </button>
        </div>
      ) : (
        <div>
          <h2>{t('shippingAddresses.myAddresses')}</h2>
          {addresses.length === 0 ? (
            <p>{t('shippingAddresses.noAddresses')}</p>
          ) : (
            <ul className="address-list">
              {addresses.map(addr => (
                <li key={addr.id} className="address-card">
                  <div className="address-info">
                    <strong>{addr.nombre} {addr.apellido}</strong>
                    <br />
                    {addr.direccion} — {t('shippingAddresses.neighborhood')}: {addr.neighborhood.nombre}
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
                    label={t('shippingAddresses.default')}
                  />

                  <div className="button-group">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditAddress(addr);
                        setShowForm(true);
                      }}
                    >
                      {t('shippingAddresses.edit')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => navigate(`/${lang}/direcciones/nueva`)}>
            {t('shippingAddresses.addNewAddress')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ShippingAddresses;