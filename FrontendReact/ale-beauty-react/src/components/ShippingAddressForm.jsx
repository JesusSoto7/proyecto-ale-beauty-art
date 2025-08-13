import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ShippingAddressForm({ onSuccess }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    neighborhood_id: "",
    codigo_postal: "",
    indicaciones_adicionales: "",
  });

  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      alert("no estas autenticado");
    }
  }, []);

  // Cargar departamentos al inicio
  useEffect(() => {
    fetch("https://localhost:4000/api/v1/locations/departments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(console.error);
  }, [token]);

  // Cuando cambia el departamento, cargar municipios y resetear siguientes selects
  useEffect(() => {
    if (form.department_id) {
      fetch(`https://localhost:4000/api/v1/locations/municipalities/${form.department_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setMunicipalities(data))
        .catch(console.error);

      setMunicipalities([]);
      setNeighborhoods([]);
      setForm(prev => ({ ...prev, municipality_id: "", neighborhood_id: "" }));
    }
  }, [form.department_id, token]);

  // Cuando cambia el municipio, cargar barrios y resetear barrio
  useEffect(() => {
    if (form.municipality_id) {
      fetch(`https://localhost:4000/api/v1/locations/neighborhoods/${form.municipality_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setNeighborhoods(data))
        .catch(console.error);

      setForm(prev => ({ ...prev, neighborhood_id: "" }));
    }
  }, [form.municipality_id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      alert("No hay token válido para enviar la solicitud.");
      return;
    }

    const { department_id, municipality_id, ...addressToSend } = form;

    fetch("https://localhost:4000/api/v1/shipping_addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ shipping_address: addressToSend }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || data.errors?.join(', ') || "Error desconocido");
          });
        }
        return res.json();
      })
      .then(data => {
        if (!data.errors) {
          alert("Dirección creada con éxito");
          onSuccess && onSuccess(data);

          navigate("/direcciones");

          setForm({
            nombre: "",
            apellido: "",
            telefono: "",
            direccion: "",
            neighborhood_id: "",
            codigo_postal: "",
            indicaciones_adicionales: "",
          });
          setMunicipalities([]);
          setNeighborhoods([]);
        } else {
          alert("Errores: " + data.errors.join(", "));
        }
      })
      .catch(err => {
        alert("Error al crear dirección");
        console.error(err);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />
      <input
        name="apellido"
        value={form.apellido}
        onChange={handleChange}
        placeholder="Apellido"
        required
      />
      <input
        name="telefono"
        value={form.telefono}
        onChange={handleChange}
        placeholder="Teléfono"
        required
      />
      <input
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        placeholder="Dirección"
        required
      />

      <select
        name="department_id"
        value={form.department_id || ""}
        onChange={handleChange}
        required
      >
        <option value="">Selecciona un departamento</option>
        {departments.map(d => (
          <option key={d.id} value={d.id}>{d.nombre}</option>
        ))}
      </select>

      <select
        name="municipality_id"
        value={form.municipality_id || ""}
        onChange={handleChange}
        required
        disabled={!municipalities.length}
      >
        <option value="">Selecciona un municipio</option>
        {municipalities.map(m => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </select>

      <select
        name="neighborhood_id"
        value={form.neighborhood_id || ""}
        onChange={handleChange}
        required
        disabled={!neighborhoods.length}
      >
        <option value="">Selecciona un barrio</option>
        {neighborhoods.map(n => (
          <option key={n.id} value={n.id}>{n.nombre}</option>
        ))}
      </select>

      <input
        name="codigo_postal"
        value={form.codigo_postal}
        onChange={handleChange}
        placeholder="Código Postal"
      />

      <textarea
        name="indicaciones_adicionales"
        value={form.indicaciones_adicionales}
        onChange={handleChange}
        placeholder="Indicaciones adicionales"
      />

      <button type="submit">Guardar dirección</button>
    </form>
  );
}

export default ShippingAddressForm;
