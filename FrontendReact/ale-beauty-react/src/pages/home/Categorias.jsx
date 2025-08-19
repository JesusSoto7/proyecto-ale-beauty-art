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

const Categorias = () => {
  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [categoriaEdit, setCategoriaEdit] = useState(null);
  const token = localStorage.getItem("token");

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
    <div style={{ padding: "1rem" }}>
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

      <div style={{ marginTop: "2rem" }}>
        <h3>Listado de categorías:</h3>
        <List>
          {categorias.map((cat) => (
            <ListItem
              key={cat.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => openDialog(cat)}>
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={cat.nombre_categoria}
                secondary={
                  cat.imagen_url ? (
                    <img
                      src={cat.imagen_url}
                      alt={cat.nombre_categoria}
                      style={{ width: "50px", marginTop: "5px" }}
                    />
                  ) : null
                }
              />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default Categorias;
