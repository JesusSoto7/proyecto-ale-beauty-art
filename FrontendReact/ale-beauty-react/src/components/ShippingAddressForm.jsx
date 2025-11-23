import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Box,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

function ShippingAddressForm({ onSuccess, initialData, variant = "default" }) {
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();
  const [token, setToken] = useState(null);

  const isEditing = !!initialData;

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    department_id: "",
    municipality_id: "",
    neighborhood_id: "",
    codigo_postal: "",
    indicaciones_adicionales: "",
  });

  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  // Obtener token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert(t('shippingAddressForm.notAuthenticated'));
  }, [t]);

  // Cargar departamentos
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/locations/departments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(console.error);
  }, [token]);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        department_id: initialData.department_id || "",
        municipality_id: initialData.municipality_id || "",
        neighborhood_id: initialData.neighborhood_id || "",
        codigo_postal: initialData.codigo_postal || "",
        indicaciones_adicionales: initialData.indicaciones_adicionales || "",
      });
    }
  }, [initialData]);

  // Cargar municipios
  useEffect(() => {
    if (!form.department_id || !token) return;
    fetch(
      `https://localhost:4000/api/v1/locations/municipalities/${form.department_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setMunicipalities(data))
      .catch(console.error);
  }, [form.department_id, token]);

  // Cargar barrios
  useEffect(() => {
    if (!form.municipality_id || !token) return;
    fetch(
      `https://localhost:4000/api/v1/locations/neighborhoods/${form.municipality_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => setNeighborhoods(data))
      .catch(console.error);
  }, [form.municipality_id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) return alert(t('shippingAddressForm.noToken'));

    const { department_id, municipality_id, ...addressToSend } = form;

    const url = isEditing
      ? `https://localhost:4000/api/v1/shipping_addresses/${initialData.id}`
      : "https://localhost:4000/api/v1/shipping_addresses";

    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipping_address: addressToSend }),
    })
      .then((res) =>
        res.ok
          ? res.json()
          : res.json().then((data) => {
              throw new Error(
                data.error || data.errors?.join(", ") || t('shippingAddressForm.unknownError')
              );
            })
      )
      .then((data) => {
        alert(isEditing ? t('shippingAddressForm.updateSuccess') : t('shippingAddressForm.createSuccess'));
        if (onSuccess) onSuccess(data, isEditing);
        else navigate(`/${lang}/direcciones`);
      })
      .catch((err) => {
        alert(
          `${t('shippingAddressForm.errorPrefix')} ${isEditing ? t('shippingAddressForm.updating') : t('shippingAddressForm.creating')}: ${err.message}`
        );
        console.error(err);
      });
  };

  // Estilos reutilizables para inputs/selects
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      "& fieldset": { borderColor: "#000000ff" },
      "&:hover fieldset": { borderColor: "#ec407a" },
      "&.Mui-focused fieldset": {
        borderColor: "#f06292",
        boxShadow: "0 0 6px #f48fb1",
      },
    },
    "& .MuiInputBase-input": {
      padding: "10px 14px",
      color: "#444",
    },
    "& .MuiInputLabel-root": {
      color: "#777",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#c2185b",
    },
  };

  const containerStyles = {
    default: {
      mt: 10,
      px: 2,
    },
    checkout: {
      mt: 2,
      px: 0,
    },
  };

  const paperStyles = {
    default: {
      p: 5,
      maxWidth: 640,
      width: "100%",
      borderRadius: 5,
      background: "#fff",
    },
    checkout: {
      p: 3,
      width: "100%",
      borderRadius: 2,
      background: "transparent",
      boxShadow: "none",
    },
  };

  const titleStyles = {
    default: {
      color: "#c2185b",
      fontWeight: "bold",
      mb: 3,
    },
    checkout: {
      color: "#000",
      fontWeight: 500,
      mb: 2,
      fontSize: "18px",
    },
  };

  const buttonStyles = {
    default: {
      mt: 4,
      background: "linear-gradient(45deg, #f48fb1, #f06292)",
      "&:hover": { background: "linear-gradient(45deg, #f06292, #ec407a)" },
      borderRadius: 3,
      py: 1.2,
      fontWeight: "bold",
      fontSize: "16px",
      textTransform: "none",
      boxShadow: "0 4px 10px rgba(240,98,146,0.3)",
    },
    checkout: {
      mt: 3,
      background: "#000",
      "&:hover": { background: "#333" },
      borderRadius: 1,
      py: 1,
      fontWeight: "bold",
      fontSize: "15px",
      textTransform: "uppercase",
    },
  };

  const formFields = [
    { name: "nombre", label: t('shippingAddressForm.firstName') },
    { name: "apellido", label: t('shippingAddressForm.lastName') },
    { name: "telefono", label: t('shippingAddressForm.phone') },
    { name: "direccion", label: t('shippingAddressForm.address') },
    { name: "codigo_postal", label: t('shippingAddressForm.postalCode') },
  ];

  return (
    <Box display="flex" justifyContent="center" sx={containerStyles[variant]}>
      <Paper elevation={variant === "default" ? 6 : 0} sx={paperStyles[variant]}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={titleStyles[variant]}
        >
          {isEditing ? t('shippingAddressForm.editTitle') : t('shippingAddressForm.newTitle')}
        </Typography>

        <form onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              fullWidth
              margin="normal"
              value={form[field.name]}
              onChange={handleChange}
              required={["nombre", "apellido", "telefono", "direccion"].includes(field.name)}
              sx={inputStyles}
              inputProps={ field.name === "codigo_postal" ? { maxLength: 6, minLength: 6 } : {} }
            />
          ))}

          <FormControl fullWidth margin="normal" sx={inputStyles}>
            <InputLabel>{t('shippingAddressForm.department')}</InputLabel>
            <Select
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              required
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id} sx={{ color: "#444" }}>
                  {d.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" sx={inputStyles}>
            <InputLabel>{t('shippingAddressForm.municipality')}</InputLabel>
            <Select
              name="municipality_id"
              value={form.municipality_id}
              onChange={handleChange}
              required
              disabled={!municipalities.length}
            >
              {municipalities.map((m) => (
                <MenuItem key={m.id} value={m.id} sx={{ color: "#444" }}>
                  {m.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" sx={inputStyles}>
            <InputLabel>{t('shippingAddressForm.neighborhood')}</InputLabel>
            <Select
              name="neighborhood_id"
              value={form.neighborhood_id}
              onChange={handleChange}
              required
              disabled={!neighborhoods.length}
            >
              {neighborhoods.map((n) => (
                <MenuItem key={n.id} value={n.id} sx={{ color: "#444" }}>
                  {n.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="indicaciones_adicionales"
            label={t('shippingAddressForm.additionalInstructions')}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={form.indicaciones_adicionales}
            onChange={handleChange}
            sx={inputStyles}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={buttonStyles[variant]}
          >
            {t('shippingAddressForm.saveButton')}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default ShippingAddressForm;