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
    <div style={{ marginTop: "2rem" }}>
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
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          padding: "10px 0",
        }}
      >
        {categorias.map((cat) => (
          <div
            key={cat.id}
            style={{
              minWidth: "250px",
              background: "#302735ff",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              flexShrink: 0,
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onClick={() => navigate(`/categories/${cat.id}`)} // 👈 redirige
          >
            {/* Imagen con curva */}
            <div style={{ position: "relative" }}>
              <img
                src={
                  cat.imagen_url ||
                  "https://via.placeholder.com/300x200?text=Sin+imagen"
                }
                alt={cat.nombre_categoria}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-20px",
                  left: 0,
                  width: "100%",
                  height: "40px",
                  background: "#302735ff",
                  borderTopLeftRadius: "50% 40px",
                  borderTopRightRadius: "50% 0px",
                }}
              />
            </div>

            {/* Info */}
            <div style={{ padding: "1rem", textAlign: "center" }}>
              <h4 style={{ margin: 0, fontWeight: "bold", color: "white" }}>
                {cat.nombre_categoria}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categorias;
