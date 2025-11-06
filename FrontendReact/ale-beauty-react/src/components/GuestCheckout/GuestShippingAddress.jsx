import { useState, useMemo, useEffect } from "react";
import { TextField, Button, Box, Typography, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

export default function GuestShippingAddress({
  initialData,
  onComplete,
  onEditingChange, // <- notifica si se está editando
  creating = false
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(true);
  const [form, setForm] = useState(() => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  }));

  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  const isValid = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.address.trim();
  }, [form]);

  const handleSave = () => {
    if (!isValid) return;
    onComplete?.(form);   // guarda en el padre
    setIsEditing(false);  // muestra el resumen
  };

  return (
    <div>
      <h2>{t("checkout.shippingAddressTitle")}</h2>

      {!isEditing ? (
        <Box
          className="address-info"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "start",
            gap: 1.5,
            p: 1.5,
            border: "1px solid #eee",
            borderRadius: 2,
            wordBreak: "break-word",
          }}
        >
          <div>
            <strong>{form.name}</strong>
            <br />
            {form.email} · {form.phone}
            <br />
            {t("checkout.address")}: {form.address}
          </div>

          <Tooltip title={t("common.edit")} arrow>
            <IconButton
              aria-label={t("common.edit")}
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{
                // Mantenerlo visible y alineado dentro del contenedor
                alignSelf: "start",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                height: 32,
                width: 32,
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box component="form" sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label={t("common.name")}
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
            label={t("common.phone")}
            size="small"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label={t("checkout.address")}
            size="small"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            multiline
            minRows={2}
          />

          {!isValid && (
            <Typography variant="body2" color="error">
              {t("checkout.fillAllFields")}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d63384" } }}
              disabled={!isValid || creating}
              onClick={handleSave}
            >
              {creating ? (t("common.loading") || "Cargando...") : (t("shippingAddressForm.saveButton") || "Guardar dirección")}
            </Button>
          </Box>
        </Box>
      )}
    </div>
  );
}