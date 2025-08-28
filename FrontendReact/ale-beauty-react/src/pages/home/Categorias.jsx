import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

const Categorias = () => {
  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar categorías al inicio
  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando categorías", err));
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

      if (categoriaEdit) {
        setCategorias((prev) =>
          prev.map((cat) => (cat.id === categoriaActualizada.id ? categoriaActualizada : cat))
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

  return (
    <div style={{ marginTop: "2rem", width: "80%", }}>
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
          <DialogTitle>{categoriaEdit ? "Editar categoría" : "Crear nueva categoría"}</DialogTitle>
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

      <div className="categories-container"
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          padding: "10px 0",
        }}
      >
        {categorias.map((cat) => (
          <div className="category-card" style={{minWidth: "250px", maxWidth: "250px"}} onClick={() => navigate(`/es/home/categories/${cat.id}`)}>
            {/* Imagen con curvas */}
            <div className="category-image-wrapper">
              <img
                src={cat.imagen_url || "https://via.placeholder.com/300x200?text=Sin+imagen"}
                alt={cat.nombre_categoria}
                className="category-image"
              />
            </div>

            {/* Info */}
            <div className="category-info" style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>{cat.nombre_categoria}</h4>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    openDialog(cat);
                  }}
                  style={{border: "1px solid #242424" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </div>
              <span style={{ fontSize: "12px", color: "#888" }}>2 hours ago</span>
            </div>

          </div>

        ))}
      </div>
    </div>
  );
};

export default Categorias;
