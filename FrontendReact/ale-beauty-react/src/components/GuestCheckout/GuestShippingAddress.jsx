import { useState, useMemo } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

export default function GuestShippingAddress({ initialData, onComplete }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(true);
  const [form, setForm] = useState(() => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  }));

  const isValid = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.address.trim();
  }, [form]);

  const handleSave = () => {
    if (!isValid) return;
    setIsEditing(false);
    onComplete?.(form);
  };

  return (
    <div>
      <h2>{t("checkout.shippingAddressTitle")}</h2>

      {!isEditing ? (
        <div className="address-info" style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          gap: 12, padding: 12, border: "1px solid #eee", borderRadius: 8
        }}>
          <div>
            <strong>{form.name}</strong>
            <br />
            {form.email} · {form.phone}
            <br />
            {t("checkout.address")}: {form.address}
          </div>
          <button
            id="editBtn"
            onClick={() => setIsEditing(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer"
            }}
          >
            <EditIcon fontSize="small" />
            {t("common.edit") || "Editar"}
          </button>
        </div>
      ) : (
        <Box component="form" sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label={t("common.name") || "Nombre"}
            size="small"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Email"
            size="small"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label={t("common.phone") || "Teléfono"}
            size="small"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label={t("checkout.address") || "Dirección"}
            size="small"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            multiline
            minRows={2}
          />

          {!isValid && (
            <Typography variant="body2" color="error">
              {t("checkout.fillAllFields") || "Completa los datos para continuar"}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d63384" } }}
              disabled={!isValid}
              onClick={handleSave}
            >
              {t("checkout.continueButton")}
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
}