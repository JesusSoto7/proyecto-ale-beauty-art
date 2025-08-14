import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

function Carousel() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Cargar imágenes actuales
  const loadImages = async () => {
    try {
      const res = await fetch("https://localhost:4000/api/v1/carousel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadImages();
  }, [token]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    setImage(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleSave = async () => {
    if (!file) return alert("Selecciona una imagen primero");

    const formData = new FormData();
    formData.append("user[carousel_images][]", file);

    setLoading(true);
    try {
      const res = await fetch("https://localhost:4000/api/v1/carousel", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setImage(null);
        setFile(null);
        loadImages(); // Actualiza las imágenes automáticamente
      } else {
        const data = await res.json();
        alert("Error: " + (data.errors ? data.errors.join(", ") : "Ocurrió un error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta imagen?")) return;

    try {
      const res = await fetch(`https://localhost:4000/api/v1/carousel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadImages(); // Actualiza las imágenes automáticamente
      } else {
        const data = await res.json();
        alert("Error: " + (data.errors ? data.errors.join(", ") : "Ocurrió un error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la imagen");
    }
  };

  return (
    <Box>
      <Paper {...getRootProps()} sx={{ padding: 4, textAlign: "center", cursor: "pointer", border: "2px dashed #1976d2" }}>
        <input {...getInputProps()} />
        <Typography>Arrastra y suelta una imagen aquí, o haz clic para seleccionar</Typography>
      </Paper>

      {image && (
        <Box mt={2} textAlign="center">
          <Typography>Vista previa:</Typography>
          <img src={image} alt="preview" style={{ maxWidth: "100%", maxHeight: 300, marginTop: 10 }} />
        </Box>
      )}

      <Box mt={2} textAlign="center">
        <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Subiendo..." : "Guardar"}
        </Button>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Imágenes del carousel:</Typography>
        <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
          {images.map((img) => (
            <Box key={img.id} textAlign="center">
              <img
                src={img.url}
                alt="carousel"
                style={{ width: 150, height: 100, objectFit: "cover", display: "block", marginBottom: 5 }}
              />
              <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(img.id)}>
                Eliminar
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Carousel;
