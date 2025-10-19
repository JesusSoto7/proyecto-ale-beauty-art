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
import "../../assets/stylesheets/SubCategories.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";

const SubCategorias = () => {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const [subCategorias, setSubCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState(null);
  const [subCategoriaEdit, setSubCategoriaEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Cargar subcategorías al inicio
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`https://localhost:4000/api/v1/categories/${slug}/sub_categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando subcategorías", err))
      .finally(() => setLoading(false));
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

      // ✅ Actualizar estado inmediatamente
      if (subCategoriaEdit) {
        setSubCategorias((prev) =>
          prev.map((cat) =>
            cat.id === subCategoriaActualizada.id ? subCategoriaActualizada : cat
          )
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
      alert("Ocurrió un error procesando la subcategoría");
    }
  };

  // ✅ Función para eliminar subcategoría
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta subcategoría?")) return;

    try {
      const res = await fetch(
        `https://localhost:4000/api/v1/categories/${slug}/sub_categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || res.statusText}`);
        return;
      }

      // ✅ Actualizar estado inmediatamente
      setSubCategorias((prev) => prev.filter((sc) => sc.id !== id));
      alert("Subcategoría eliminada correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error eliminando la subcategoría");
    }
  };

  return (
    <div style={{ marginTop: "2rem", width: "80%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>SubCategorías</h3>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Agregar SubCategoría
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {subCategoriaEdit ? "Editar subcategoría" : "Crear nueva SubCategoría"}
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
              {subCategoriaEdit ? "Actualizar" : "Crear"}
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
        ) : subCategorias.length === 0 ? (
          <p style={{ color: "#888", fontWeight: 500 }}>
            No hay subcategorías todavía.
          </p>
        ) : (
          subCategorias.map((sc) => (
            <div
              key={sc.id}
              className="subcategory-card"
              style={{ minWidth: "250px", maxWidth: "250px" }}
            >
              <div className="subcategory-image-wrapper">
                <img
                  src={
                    sc.imagen_url ||
                    "https://via.placeholder.com/300x200?text=Sin+imagen"
                  }
                  alt={sc.nombre}
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
                  <div>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDialog(sc);
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
                        handleDelete(sc.id);
                      }}
                      style={{ border: "1px solid #dc2626", color: "#dc2626" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {sc.category?.nombre_categoria || "Sin categoría"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubCategorias;