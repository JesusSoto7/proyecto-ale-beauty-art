import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    else alert("No está autenticado");
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('https://localhost:4000/api/v1/categories', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch('https://localhost:4000/api/v1/sub_categories', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSubCategories(data));

    fetch('https://localhost:4000/api/v1/discounts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setDiscounts(data));
  }, [token]);

  // Filtra las subcategorías para la categoría seleccionada
  const filteredSubCategories = selectedCategory
    ? subCategories.filter(sc => sc.category_id?.toString() === selectedCategory)
    : [];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategories([]); // reset subcats when category changes
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
      setSelectedSubCategories([]);
      setSelectedDiscount('');
    } catch (err) {
      setMessage('No se pudo aplicar el descuento');
    }
    setLoading(false);
  };

  const selectedDiscountObj = discounts.find(d => d.id.toString() === selectedDiscount);

  return (
    <div style={{maxWidth: 480, margin: '2em auto', fontFamily:'inherit'}}>
      <h2>Apply Discount</h2>
      <form onSubmit={handleSubmit}>
        {/* Select de categoría */}
        <label style={{fontWeight:600}}>Categoría</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{display:'block', width:'100%', marginBottom:'1em'}}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre_categoria || cat.nombre}</option>
          ))}
        </select>

        {/* Select de subcategoría filtrado */}
        <label style={{fontWeight:600}}>Subcategorías</label>
        <div style={{display:'flex', gap:'0.5em', flexWrap:'wrap', marginBottom:'1em'}}>
          {selectedSubCategories.map(subCatId => {
            const subCat = subCategories.find(c => c.id.toString() === subCatId.toString());
            return (
              <span key={subCatId} style={{
                background:'#f1f5f9', 
                borderRadius:'18px', 
                padding:'0.2em 1em', 
                display:'inline-flex', 
                alignItems:'center', 
                fontWeight:500
              }}>
                {subCat ? (subCat.nombre_subcategoria || subCat.nombre) : subCatId}
                <button type="button" style={{
                  marginLeft:'0.5em', 
                  background:'none', 
                  border:'none', 
                  cursor:'pointer', 
                  color:'#2563eb', 
                  fontSize:'1.1em'
                }} onClick={() => handleSubCategoryRemove(subCatId)}>&times;</button>
              </span>
            );
          })}
        </div>
        <select
          value=""
          onChange={handleSubCategoryAdd}
          style={{display:'block', width:'100%', marginBottom:'1em'}}
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
        <label style={{fontWeight:600}}>Discount</label>
        <select
          value={selectedDiscount}
          onChange={e => setSelectedDiscount(e.target.value)}
          style={{display:'block', width:'100%', marginBottom:'1em'}}
        >
          <option value="">Select a Discount</option>
          {discounts.map(desc => (
            <option key={desc.id} value={desc.id}>
              {desc.nombre} ({desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor}`}) {desc.activo ? '' : '(Inactivo)'}
            </option>
          ))}
        </select>

        {selectedDiscountObj &&
          <div style={{marginBottom:'1em', background:'#f3f4f6', padding:'0.6em', borderRadius:'6px'}}>
            <strong>{selectedDiscountObj.nombre}</strong> <br/>
            {selectedDiscountObj.descripcion && <span>{selectedDiscountObj.descripcion}</span>}<br/>
            <span>Tipo: {selectedDiscountObj.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}</span> <br/>
            <span>Valor: {selectedDiscountObj.tipo === 'porcentaje' ? `${selectedDiscountObj.valor}%` : `$${selectedDiscountObj.valor}`}</span> <br/>
            <span>Vigencia: {selectedDiscountObj.fecha_inicio} {selectedDiscountObj.fecha_fin ? `a ${selectedDiscountObj.fecha_fin}` : ''}</span>
          </div>
        }

        <br /><br />
        <button
          type="submit"
          disabled={loading || !selectedDiscount || selectedSubCategories.length === 0}
          style={{background: '#2563eb', color:'#fff', padding:'0.7em 2em', border:'none', borderRadius:'6px'}}
        >
          {loading ? 'Aplicando...' : 'Apply Discount'}
        </button>
        {message && <div style={{marginTop: '1em'}}>{message}</div>}
      </form>
    </div>
  );
}