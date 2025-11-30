import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogContent,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import "./../../assets/stylesheets/home.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:4000";
const DEFAULT_SKELETON_COUNT = 3;

function Carousel() {
  const [images, setImages] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [skeletonCount, setSkeletonCount] = useState(() => {
    const stored = Number(localStorage.getItem("carousel_last_count"));
    return Number.isFinite(stored) && stored >= 0 ? stored : DEFAULT_SKELETON_COUNT;
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const token = localStorage.getItem("token");
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Cargar imágenes
  const loadImages = async () => {
    if (!token) return;
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/api/v1/carousel`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : [];
      setImages(list);
      const count = list.length;
      setSkeletonCount(count);
      localStorage.setItem("carousel_last_count", String(count));
    } catch (err) {
      console.error("Error cargando imágenes del carrusel:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadImages();
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Dropzone para subir
  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setUploadSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxFiles: 1,
  });

  // Subir imagen
  const handleSave = async () => {
    if (uploading) return;
    if (!file) {
      alert("Selecciona una imagen primero");
      return;
    }
    const formData = new FormData();
    formData.append("user[carousel_images][]", file);
    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/api/v1/carousel`, {
        method: "PATCH",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("Error: " + (data.errors ? data.errors.join(", ") : "Ocurrió un error"));
        return;
      }
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      await loadImages();
      setUploadSuccess(true);
      window.dispatchEvent(new CustomEvent("carousel:updated"));
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  // Eliminar imagen
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta imagen?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/carousel/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("Error: " + (data.errors ? data.errors.join(", ") : "Ocurrió un error"));
        return;
      }
      await loadImages();
      window.dispatchEvent(new CustomEvent("carousel:updated"));
      if (lightboxOpen && images[currentIndex]?.id === id) {
        setLightboxOpen(false);
        setZoom(1);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la imagen");
    }
  };

  // Lightbox
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
  };

  // BannerCard (sin reordenar ni posición)
  const BannerCard = ({ img, idx }) => {
    const [loaded, setLoaded] = useState(false);
    const onError = (e) => {
      if (!e.currentTarget.dataset.fallbackApplied) {
        e.currentTarget.dataset.fallbackApplied = "1";
        e.currentTarget.src = "https://placehold.co/1280x720?text=Imagen+no+disponible";
      } else {
        setLoaded(true);
      }
    };

    return (
      <div className="banner-card">
        <div className="banner-frame" style={{ position: "relative" }}>
          <img
            className="banner-img"
            src={img.url}
            alt={`banner-${img.id}`}
            loading="lazy"
            style={{ visibility: loaded ? "visible" : "hidden" }}
            onLoad={() => setLoaded(true)}
            onError={onError}
            onClick={() => openLightbox(idx)}
          />
          {!loaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{
                height: "100%",
                position: "absolute",
                inset: 0,
                borderRadius: "12px",
              }}
            />
          )}
        </div>
        <div className="banner-actions">
          <Button
            variant="contained"
            color="primary"
            onClick={() => openLightbox(idx)}
            sx={{ textTransform: "none" }}
          >
            Ver grande
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(img.id)}
            startIcon={<DeleteIcon />}
            sx={{ textTransform: "none" }}
          >
            Eliminar
          </Button>
        </div>
      </div>
    );
  };

  // Render
  return (
    <div className="upload-container">
      {/* Panel de subida */}
      <div className="dropzoneBox">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
          aria-label="Zona para subir imágenes"
        >
          <input {...getInputProps()} />
          <ImageIcon fontSize="large" sx={{ color: "#7e6bfb" }} />
          <p>
            Arrastra y suelta una <span>imagen</span> aquí, o haz clic para
            seleccionar un <span>archivo</span>
          </p>
        </div>

        {file && (
          <div className="file-preview">
            <img src={preview} alt="preview" loading="lazy" />
            <div className="file-meta">
              <p title={file.name}>{file.name}</p>
              <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
            <button
              className="remove"
              onClick={() => {
                setFile(null);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
              }}
              aria-label="Quitar imagen seleccionada"
              title="Quitar"
            >
              ✖
            </button>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleSave}
          disabled={uploading}
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>

        {uploadSuccess && (
          <div className="success-message" role="status">
            <span className="check">✔</span> Archivo subido correctamente
          </div>
        )}
      </div>

      {/* Lista imágenes */}
      <div className="banners-list">
        <div className="banners-header">
          <h3>Imágenes del carrusel</h3>
        </div>

        <div className="banners-grid">
          {loadingList &&
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={`sk-${i}`} className="banner-card">
                <div className="banner-frame" style={{ position: "relative", marginBottom: 10 }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ height: "clamp(280px, 28vw, 420px)", borderRadius: "12px" }}
                  />
                </div>
                <div className="banner-actions" style={{ gap: 12, display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                  <Skeleton variant="rectangular" width={110} height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={110} height={40} sx={{ borderRadius: 1 }} />
                </div>
              </div>
            ))}

          {!loadingList && images.length === 0 && (
            <div className="empty-state">No hay imágenes todavía. Sube la primera arriba.</div>
          )}

          {!loadingList &&
            images.map((img, idx) => <BannerCard key={img.id} img={img} idx={idx} />)}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0,0,0,0.92)",
            color: "#fff",
            overflow: "hidden",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            p: { xs: 1, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: 420, md: 600 },
          }}
        >
          {images[currentIndex] && (
            <img
              src={images[currentIndex].url}
              alt={`banner-${images[currentIndex].id}`}
              style={{
                maxWidth: "96vw",
                maxHeight: "82vh",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
                background: "rgba(0,0,0,0.2)",
              }}
              draggable={false}
              onError={(e) => {
                if (!e.currentTarget.dataset.fallbackApplied) {
                  e.currentTarget.dataset.fallbackApplied = "1";
                  e.currentTarget.src = "https://placehold.co/1600x900?text=Imagen+no+disponible";
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Carousel;