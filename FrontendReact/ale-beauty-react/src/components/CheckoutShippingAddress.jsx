import { useState, useEffect } from "react";
import ShippingAddressForm from "./ShippingAddressForm";
import EditIcon from "@mui/icons-material/Edit";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

function CheckoutShippingAddress({ onAddressSelected }) {
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert(t("checkout.notAuthenticated"));
    }
  }, [t]);

  useEffect(() => {
    if (!token) return;

    fetch("https://localhost:4000/api/v1/shipping_addresses/predeterminada", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error(`${t("checkout.errorLoadingAddress")}: ${res.status}`);
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
  }, [token, onAddressSelected, t]);

  if (loading) return <p>{t("checkout.loadingAddress")}</p>;

  return (
    <div>
      <h2>{t("checkout.shippingAddressTitle")}</h2>

      {address && !isEditing ? (
        <div className="address-info">
          <div>
            <strong>
              {address.nombre} {address.apellido}
            </strong>
            <br />
            {address.direccion} — {t("checkout.neighborhood")}:{" "}
            {address.neighborhood?.nombre}
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
              color="secondary"
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckoutShippingAddress;
