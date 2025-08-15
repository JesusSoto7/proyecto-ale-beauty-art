import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ShippingAddressForm({ onSuccess, initialData }) {
  const navigate = useNavigate();
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
    else alert("No estás autenticado");
  }, []);

  // Cargar departamentos
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/locations/departments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setDepartments(data))
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

  // Cargar municipios cuando cambia department_id o si estamos editando
  useEffect(() => {
    if (!form.department_id || !token) return;

    fetch(`https://localhost:4000/api/v1/locations/municipalities/${form.department_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMunicipalities(data);

        if (initialData?.municipality_id) {
          setForm(prev => ({ ...prev, municipality_id: initialData.municipality_id }));
        }
      })
      .catch(console.error);
  }, [form.department_id, token, initialData]);

  useEffect(() => {
    if (!form.municipality_id || !token) return;

    fetch(`https://localhost:4000/api/v1/locations/neighborhoods/${form.municipality_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setNeighborhoods(data);
        // Si estamos editando y tenemos initialData, seleccionamos el barrio
        if (initialData?.neighborhood_id) {
          setForm(prev => ({ ...prev, neighborhood_id: initialData.neighborhood_id }));
        }
      })
      .catch(console.error);
  }, [form.municipality_id, token, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) return alert("No hay token válido para enviar la solicitud.");

    const { department_id, municipality_id, ...addressToSend } = form;

    const url = isEditing
      ? `https://localhost:4000/api/v1/shipping_addresses/${initialData.id}`
      : "https://localhost:4000/api/v1/shipping_addresses";

    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ shipping_address: addressToSend }),
    })
      .then(res => res.ok ? res.json() : res.json().then(data => { throw new Error(data.error || data.errors?.join(', ') || "Error desconocido") }))
      .then(data => {
        alert(isEditing ? "Dirección actualizada con éxito" : "Dirección creada con éxito");
        onSuccess && onSuccess(data, isEditing);
        navigate("/direcciones");
      })
      .catch(err => {
        alert(`Error al ${isEditing ? "actualizar" : "crear"} dirección`);
        console.error(err);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" required />
      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" required />
      <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" required />

      <select name="department_id" value={form.department_id} onChange={handleChange} required>
        <option value="">Selecciona un departamento</option>
        {departments.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
      </select>

      <select name="municipality_id" value={form.municipality_id} onChange={handleChange} required disabled={!municipalities.length}>
        <option value="">Selecciona un municipio</option>
        {municipalities.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
      </select>

      <select name="neighborhood_id" value={form.neighborhood_id} onChange={handleChange} required disabled={!neighborhoods.length}>
        <option value="">Selecciona un barrio</option>
        {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
      </select>

      <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} placeholder="Código Postal" />
      <textarea name="indicaciones_adicionales" value={form.indicaciones_adicionales} onChange={handleChange} placeholder="Indicaciones adicionales" />

      <button type="submit">Guardar dirección</button>
    </form>
  );
}

export default ShippingAddressForm;
