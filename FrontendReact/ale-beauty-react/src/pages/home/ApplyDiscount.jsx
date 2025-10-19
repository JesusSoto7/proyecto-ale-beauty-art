import React, { useEffect, useState } from 'react';
import { Alert, Collapse, IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from '@mui/icons-material/Close';

export default function ApplyDiscount() {
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subcatDiscounts, setSubcatDiscounts] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);

  // Fetch all data
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoadingTable(true);
    Promise.all([
      fetch('https://localhost:4000/api/v1/categories', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setCategories(data)),
      fetch('https://localhost:4000/api/v1/sub_categories', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setSubCategories(data)),
      fetch('https://localhost:4000/api/v1/discounts', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setDiscounts(data)),
      fetch('https://localhost:4000/api/v1/subcategory_discounts', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setSubcatDiscounts(Array.isArray(data) ? data : [])),
    ]).finally(() => setLoadingTable(false));
  }, [token]);

  // Refresh asignaciones al aplicar/eliminar descuento
  useEffect(() => {
    if (!token) return;
    setLoadingTable(true);
    fetch('https://localhost:4000/api/v1/subcategory_discounts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSubcatDiscounts(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTable(false));
  }, [message, token]);

  // Filtra las subcategorías para la categoría seleccionada
  const filteredSubCategories = selectedCategory
    ? subCategories.filter(sc => sc.category_id?.toString() === selectedCategory)
    : [];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategories([]);
  };

  const handleSubCategoryAdd = (e) => {
    const value = e.target.value;
    if (value && !selectedSubCategories.includes(value)) {
      setSelectedSubCategories([...selectedSubCategories, value]);
    }
  };

  const handleSubCategoryRemove = (subCatId) => {
    setSelectedSubCategories(selectedSubCategories.filter(id => id !== subCatId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      for (const subCatId of selectedSubCategories) {
        const res = await fetch('https://localhost:4000/api/v1/subcategory_discounts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subcategory_discount: {
              sub_category_id: subCatId,
              discount_id: selectedDiscount,
            }
          })
        });
        if (!res.ok) throw new Error('Error al asignar descuento');
      }
      setMessage('¡Descuento aplicado correctamente!');
      setAlertOpen(true);
      setSelectedSubCategories([]);
      setSelectedDiscount('');
    } catch (err) {
      setMessage('No se pudo aplicar el descuento');
      setAlertOpen(true);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres quitar el descuento de esta subcategoría?")) return;
    setLoading(true);
    try {
      const res = await fetch(`https://localhost:4000/api/v1/subcategory_discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setMessage("Descuento eliminado.");
      setSubcatDiscounts(subcatDiscounts.filter(scd => scd.id !== id));
      setAlertOpen(true);
    } catch {
      setMessage("No se pudo eliminar el descuento.");
      setAlertOpen(true);
    }
    setLoading(false);
  };

  const selectedDiscountObj = discounts.find(d => d.id.toString() === selectedDiscount);

  // Estilos tipo dashboard
  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    padding: "2.5em",
    margin: "3em auto",
    maxWidth: 900,
    border: "1px solid #eee",
    fontFamily: "inherit"
  };

  const inputStyle = {
    width: "100%",
    padding: "0.85em",
    margin: "0.5em 0 1.2em 0",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1em",
    background: "#f8fafc"
  };

  const labelStyle = {
    fontWeight: 600,
    marginBottom: "0.2em",
    display: "block",
    color: "#374151"
  };

  const buttonStyle = {
    background: '#2563eb',
    color:'#fff',
    padding:'0.9em 2em',
    border:'none',
    borderRadius:'8px',
    fontWeight: 700,
    fontSize: "1.05em",
    boxShadow: "0 1px 4px rgba(37,99,235,0.14)",
    cursor: 'pointer'
  };

  const chipStyle = {
    background:'#f1f5f9',
    borderRadius:'18px',
    padding:'0.32em 1.1em',
    display:'inline-flex',
    alignItems:'center',
    fontWeight:500,
    fontSize: "0.97em",
    marginBottom: "0.2em"
  };

  const chipButtonStyle = {
    marginLeft:'0.5em',
    background:'none',
    border:'none',
    cursor:'pointer',
    color:'#2563eb',
    fontSize:'1.18em',
    lineHeight: 1
  };

  const discountCardStyle = {
    marginBottom:'1em',
    background:'#f3f4f6',
    padding:'0.8em 1em',
    borderRadius:'8px',
    fontWeight: 500
  };

  // --- Aquí termina el formulario ---

  return (
    <div style={{display:"flex", flexDirection:"row", gap:"2em", justifyContent:"center", alignItems:"flex-start", flexWrap:"wrap"}}>
      <div style={cardStyle}>
        <h2 style={{marginBottom:"2em", fontWeight:700, fontSize:"1.7em", color:'#2563eb'}}>Aplicar Descuento a Subcategorías</h2>
        {/* ALERTA */}
        <Collapse in={alertOpen && message}>
          <Alert
            severity={message.includes('No se pudo') ? "error" : "success"}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setAlertOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2, fontWeight: 600 }}
          >
            {message}
          </Alert>
        </Collapse>
        <form onSubmit={handleSubmit}>
          {/* Select de categoría */}
          <label style={labelStyle}>Categoría</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={inputStyle}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre_categoria || cat.nombre}</option>
            ))}
          </select>
          {/* Chips de subcategoría seleccionadas */}
          <label style={labelStyle}>Subcategorías</label>
          <div style={{display:'flex', gap:'0.6em', flexWrap:'wrap', marginBottom:'1em'}}>
            {selectedSubCategories.map(subCatId => {
              const subCat = subCategories.find(c => c.id.toString() === subCatId.toString());
              return (
                <span key={subCatId} style={chipStyle}>
                  {subCat ? (subCat.nombre_subcategoria || subCat.nombre) : subCatId}
                  <button
                    type="button"
                    style={chipButtonStyle}
                    onClick={() => handleSubCategoryRemove(subCatId)}
                    title="Quitar subcategoría"
                    aria-label="Quitar subcategoría"
                  >&times;</button>
                </span>
              );
            })}
          </div>
          {/* Select de subcategoría filtrado */}
          <select
            value=""
            onChange={handleSubCategoryAdd}
            style={inputStyle}
            disabled={!selectedCategory}
          >
            <option value="">Selecciona una subcategoría</option>
            {filteredSubCategories.filter(subCat => !selectedSubCategories.includes(subCat.id.toString())).map(subCat => (
             <option key={subCat.id} value={subCat.id}>
              {subCat.nombre} 
              {subCat.category ? ` (${subCat.category.nombre_categoria})` : ""}
            </option>
            ))}
          </select>
          {/* Select de descuento */}
          <label style={labelStyle}>Descuento</label>
          <select
            value={selectedDiscount}
            onChange={e => setSelectedDiscount(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecciona un descuento</option>
            {discounts.map(desc => (
              <option key={desc.id} value={desc.id}>
                {desc.nombre} ({desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor}`}) {desc.activo ? '' : '(Inactivo)'}
              </option>
            ))}
          </select>
          {selectedDiscountObj &&
            <div style={discountCardStyle}>
              <strong>{selectedDiscountObj.nombre}</strong> <br/>
              {selectedDiscountObj.descripcion && <span>{selectedDiscountObj.descripcion}</span>}<br/>
              <span>Tipo: {selectedDiscountObj.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}</span> <br/>
              <span>Valor: {selectedDiscountObj.tipo === 'porcentaje' ? `${selectedDiscountObj.valor}%` : `$${selectedDiscountObj.valor}`}</span> <br/>
              <span>Vigencia: {selectedDiscountObj.fecha_inicio} {selectedDiscountObj.fecha_fin ? `a ${selectedDiscountObj.fecha_fin}` : ''}</span>
            </div>
          }
          <button
            type="submit"
            disabled={loading || !selectedDiscount || selectedSubCategories.length === 0}
            style={buttonStyle}
          >
            {loading ? 'Aplicando...' : 'Aplicar descuento'}
          </button>
        </form>
      </div>

      {/* Tabla separada */}
      <div style={{
        background:"#fff",
        borderRadius:"14px",
        boxShadow:"0 2px 12px rgba(0,0,0,0.07)",
        padding:"2em",
        maxWidth:900,
        minWidth:350,
        border:"1px solid #e5e7eb",
        fontFamily:"inherit",
        margin:"3em 0 0 0"
      }}>
        <h3 style={{marginBottom:"1em", color:"#2563eb"}}>Subcategorías con descuento</h3>
        <table style={{width:"100%", borderCollapse:"collapse", marginBottom:"2em"}}>
          <thead>
            <tr style={{background:"#f3f4f6"}}>
              <th style={{padding:"0.6em"}}>Subcategoría</th>
              <th style={{padding:"0.6em"}}>Descuento</th>
              <th style={{padding:"0.6em"}}>Tipo</th>
              <th style={{padding:"0.6em"}}>Valor</th>
              <th style={{padding:"0.6em"}}>Activo</th>
              <th style={{padding:"0.6em"}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr>
                <td colSpan={6} style={{textAlign:"center", padding:"2em"}}>
                  <CircularProgress color="primary" />
                  <div style={{color:"#2563eb", fontWeight:600, marginTop:"0.7em"}}>Cargando descuentos asignados...</div>
                </td>
              </tr>
            ) : subcatDiscounts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{textAlign:"center", color:"#64748b", fontWeight:500, padding:"2em"}}>
                  No hay descuentos asignados aún.
                </td>
              </tr>
            ) : (
              subcatDiscounts.map(cd => {
                const subCat = subCategories.find(sc => sc.id === cd.sub_category_id || sc.id.toString() === cd.sub_category_id?.toString());
                const desc = discounts.find(d => d.id === cd.discount_id || d.id.toString() === cd.discount_id?.toString());
                function esDescuentoActivo(desc) {
                  if (!desc) return false;
                  const hoy = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD
                  return desc.activo &&
                    desc.fecha_inicio <= hoy &&
                    (!desc.fecha_fin || desc.fecha_fin >= hoy);
                }
                return (
                  <tr key={cd.id} style={{borderBottom:"1px solid #eee"}}>
                    <td style={{padding:"0.7em"}}>{subCat ? (subCat.nombre_subcategoria || subCat.nombre) : cd.sub_category_id}</td>
                    <td style={{padding:"0.7em"}}>{desc ? desc.nombre : cd.discount_id}</td>
                    <td style={{padding:"0.7em"}}>{desc ? desc.tipo : ""}</td>
                    <td style={{padding:"0.7em"}}>{desc ? (desc.tipo === "porcentaje" ? `${desc.valor}%` : `$${desc.valor}`) : ""}</td>
                    <td style={{padding:"0.7em"}}>
                      {desc ? (
                        esDescuentoActivo(desc)
                          ? <span style={{color:"#16a34a", fontWeight:600}}>Sí</span>
                          : <span style={{color:"#dc2626", fontWeight:600}}>No</span>
                      ) : ""}
                    </td>
                    <td style={{padding:"0.7em"}}>
                      <button
                        style={{
                          color:"#dc2626",
                          background:"none",
                          border:"none",
                          fontWeight:"bold",
                          cursor:"pointer",
                          fontSize:"1em",
                          padding:"0.3em 1em",
                          borderRadius:"6px",
                          transition:"background 0.2s",
                        }}
                        onClick={() => handleDelete(cd.id)}
                        title="Eliminar descuento"
                        onMouseOver={e => e.currentTarget.style.background = "#fee2e2"}
                        onMouseOut={e => e.currentTarget.style.background = "none"}
                      >Eliminar</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}