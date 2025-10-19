import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router-dom";

const Categorias = () => {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar categorías al inicio
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("https://localhost:4000/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err))
      .finally(() => setLoading(false));
  }, [token]);

  const openDialog = (categoria = null) => {
    if (categoria) {
      setCategoriaEdit(categoria);
      setNombre(categoria.nombre_categoria);
    } else {
      setCategoriaEdit(null);
      setNombre("");
      setImagen(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return;

    const formData = new FormData();
    formData.append("category[nombre_categoria]", nombre);
    if (imagen) formData.append("category[imagen]", imagen);

    try {
      let url = "https://localhost:4000/api/v1/categories";
      let method = "POST";

      if (categoriaEdit) {
        url += `/${categoriaEdit.id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || res.statusText}`);
        return;
      }

      const categoriaActualizada = await res.json();

      // ✅ Actualizar estado inmediatamente
      if (categoriaEdit) {
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === categoriaActualizada.id ? categoriaActualizada : cat
          )
        );
      } else {
        setCategorias((prev) => [...prev, categoriaActualizada]);
      }

      setNombre("");
      setImagen(null);
      setCategoriaEdit(null);
      setOpen(false);
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error procesando la categoría");
    }
  };

  // ✅ Función para eliminar categoría
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      const res = await fetch(`https://localhost:4000/api/v1/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || res.statusText}`);
        return;
      }

      // ✅ Actualizar estado inmediatamente
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
      alert("Categoría eliminada correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error eliminando la categoría");
    }
  };

  return (
    <div style={{ marginTop: "2rem", width: "80%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Categorías</h3>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Agregar Categoría
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {categoriaEdit ? "Editar categoría" : "Crear nueva categoría"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ marginTop: 1 }}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                fullWidth
                autoFocus
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {categoriaEdit ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <div
        className="categories-container"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          padding: "10px 0",
        }}
      >
        {loading ? (
          // ✅ SKELETONS MIENTRAS CARGA
          [1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              style={{
                minWidth: "250px",
                maxWidth: "250px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Skeleton variant="rectangular" width={250} height={200} />
              <div style={{ padding: "16px" }}>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="40%" height={20} />
              </div>
            </div>
          ))
        ) : categorias.length === 0 ? (
          <p style={{ color: "#888", fontWeight: 500 }}>
            No hay categorías todavía.
          </p>
        ) : (
          categorias.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              style={{ minWidth: "250px", maxWidth: "250px" }}
              onClick={() => navigate(`/es/home/categories/${cat.slug}`)}
            >
              <div className="category-image-wrapper">
                <img
                  src={
                    cat.imagen_url ||
                    "https://via.placeholder.com/300x200?text=Sin+imagen"
                  }
                  alt={cat.nombre_categoria}
                  className="category-image"
                />
              </div>

              <div className="category-info" style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h4 style={{ margin: 0 }}>{cat.nombre_categoria}</h4>
                  <div>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDialog(cat);
                      }}
                      style={{ border: "1px solid #242424", marginRight: "8px" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {/* ✅ BOTÓN DE ELIMINAR */}
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(cat.id);
                      }}
                      style={{ border: "1px solid #dc2626", color: "#dc2626" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {cat.sub_categories?.length || 0} subcategorías
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categorias;