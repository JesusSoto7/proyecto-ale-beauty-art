import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ImageIcon from "@mui/icons-material/Image";
import "./../../assets/stylesheets/home.css";

function Carousel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false); // ✅ estado para éxito
  const token = localStorage.getItem("token");

  // 🔹 Cargar banners ya existentes
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
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadSuccess(false); // resetear mensaje cuando se selecciona otra img
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const handleSave = async () => {
    if (!file) return alert("Selecciona una imagen primero");

    const formData = new FormData();
    formData.append("user[carousel_images][]", file);

    try {
      const res = await fetch("https://localhost:4000/api/v1/carousel", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        setPreview(null);
        loadImages();
        setUploadSuccess(true); // ✅ mostrar mensaje
        setTimeout(() => setUploadSuccess(false), 3000); // ocultar en 3s
      } else {
        const data = await res.json();
        alert(
          "Error: " +
            (data.errors ? data.errors.join(", ") : "Ocurrió un error")
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
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
        loadImages();
      } else {
        const data = await res.json();
        alert(
          "Error: " +
            (data.errors ? data.errors.join(", ") : "Ocurrió un error")
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la imagen");
    }
  };

  return (
    <div className="upload-container">
      <div className="dropzoneBox">
        {/* 🔹 Zona Drag & Drop */}
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          <ImageIcon fontSize="large" sx={{ color: "#7e6bfb" }} />
          <p>
            Arrastra y suelta una <span>imagen</span> aquí, o haz clic{" "}
            para seleccionar un <span>archivo</span>
          </p>
        </div>

        {/* 🔹 Vista previa de nueva imagen (entre dropzone y botón) */}
        {file && (
          <div className="file-preview">
            <img src={preview} alt="preview" />
            <p>{file.name}</p>
            <button
              className="remove"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              ✖
            </button>
          </div>
        )}

        {/* 🔹 Botón Upload */}
        <button className="upload-btn" onClick={handleSave}>
          Subir
        </button>

        {/* 🔹 Mensaje de éxito */}
        {uploadSuccess && (
          <div className="success-message">
            <span className="check">✔</span> Archivo subido correctamente
          </div>
        )}
      </div>

      {/* 🔹 Banners ya guardados */}
      <div className="banners-list">
        <h3>Imágenes del carousel</h3>
        <div className="banners-grid">
          {images.map((img) => (
            <div key={img.id} className="banner-card">
              <img src={img.url} alt="banner" />
              <button onClick={() => handleDelete(img.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Carousel;
