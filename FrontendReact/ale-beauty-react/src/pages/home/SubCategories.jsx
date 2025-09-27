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
import "../../assets/stylesheets/SubCategories.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useNavigate } from "react-router-dom";

const SubCategorias = () => {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const [subCategorias, setSubCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [subCategoriaEdit, setSubCategoriaEdit] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar categorías al inicio
  useEffect(() => {
    if (!token) return;
    fetch(`https://localhost:4000/api/v1/categories/${slug}/sub_categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando subcategorías", err));
  }, [token, slug]);

  const openDialog = (sub_category = null) => {
    if (sub_category) {
      setSubCategoriaEdit(sub_category);
      setNombre(sub_category.nombre);
    } else {
      setSubCategoriaEdit(null);
      setNombre("");
      setImagen(null);
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return;

    const formData = new FormData();
    formData.append("sub_category[nombre]", nombre);
    if (imagen) formData.append("sub_category[imagen]", imagen);

    try {
      let url = `https://localhost:4000/api/v1/categories/${slug}/sub_categories`;
      let method = "POST";

      if (subCategoriaEdit) {
        url += `/${subCategoriaEdit.id}`;
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

      const subCategoriaActualizada = await res.json();

      if (subCategoriaEdit) {
        setSubCategorias((prev) =>
          prev.map((cat) => (cat.id === subCategoriaActualizada.id ? subCategoriaActualizada : cat))
        );
      } else {
        setSubCategorias((prev) => [...prev, subCategoriaActualizada]);
      }

      setNombre("");
      setImagen(null);
      setSubCategoriaEdit(null);
      setOpen(false);
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error procesando la categoría");
    }
  };

  return (
    <div style={{ marginTop: "2rem", width: "80%", }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>SubCategorías</h3>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Agregar SubCategoria
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{subCategoriaEdit ? "Editar subCategoria" : "Crear nueva SubCategoria"}</DialogTitle>
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
              {subCategoriaEdit ? "Actualizar" : "Crear"}
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
        {subCategorias.map((sc) => (
          <div
            key={sc.id}
            className="subcategory-card"
            style={{ minWidth: "250px", maxWidth: "250px" }}
          >
            <div className="subcategory-image-wrapper">
              <img
                src={
                  sc.imagen_url || "https://via.placeholder.com/300x200?text=Sin+imagen"
                }
                alt={sc.nombre_subcategoria}
                className="subcategory-image"
              />
            </div>

            <div className="subcategory-info" style={{ padding: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>{sc.nombre}</h4>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    openDialog(sc);
                  }}
                  style={{ border: "1px solid #242424" }}
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

export default SubCategorias;
