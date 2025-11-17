import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Button,
  Stack,
} from "@mui/material";
import "./../../assets/stylesheets/home.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:4000";

function Carousel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const token = localStorage.getItem("token");

  const loadImages = async () => {
    if (!token) return;
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/api/v1/carousel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSave = async () => {
    if (!file) return alert("Selecciona una imagen primero");
    const formData = new FormData();
    formData.append("user[carousel_images][]", file);
    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/api/v1/carousel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta imagen?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/carousel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("Error: " + (data.errors ? data.errors.join(", ") : "Ocurrió un error"));
        return;
      }
      await loadImages();
      if (lightboxOpen && images[currentIndex]?.id === id) {
        setLightboxOpen(false);
        setZoom(1);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la imagen");
    }
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
  };
  const showPrev = () => {
    if (!images.length) return;
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
  };
  const showNext = () => {
    if (!images.length) return;
    setCurrentIndex((i) => (i + 1) % images.length);
    setZoom(1);
  };
  const zoomIn = () => setZoom((z) => Math.min(3, parseFloat((z + 0.2).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(0.4, parseFloat((z - 0.2).toFixed(2))));
  const zoomReset = () => setZoom(1);

  return (
    <div className="upload-container">
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

        <button className="upload-btn" onClick={handleSave} disabled={uploading}>
          {uploading ? "Subiendo..." : "Subir"}
        </button>

        {uploadSuccess && (
          <div className="success-message" role="status">
            <span className="check">✔</span> Archivo subido correctamente
          </div>
        )}
      </div>

      {/* Banners ya guardados */}
      <div className="banners-list">
        <div className="banners-header">
          <h3>Imágenes del carrusel</h3>
          {loadingList && (
            <span className="loading-inline">
              <CircularProgress size={16} /> Cargando…
            </span>
          )}
        </div>

        <div className="banners-grid">
          {images.length === 0 && !loadingList && (
            <div className="empty-state">
              No hay imágenes todavía. Sube la primera arriba.
            </div>
          )}

          {images.map((img, idx) => (
            <div key={img.id} className="banner-card">
              <img
                className="banner-img banner-img--contain"
                src={img.url}
                alt={`banner-${img.id}`}
                loading="lazy"
                onClick={() => openLightbox(idx)}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/1280x720?text=Imagen+no+disponible";
                }}
              />

              {/* Botones grandes, separados y abajo del card */}
              <div className="banner-actions">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openLightbox(idx)}
                  startIcon={<ChevronRightIcon />}
                  sx={{ px: 2.5, py: 1, fontWeight: 700, textTransform: "none" }}
                >
                  Ver grande
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(img.id)}
                  startIcon={<DeleteIcon />}
                  sx={{ px: 2.5, py: 1, fontWeight: 700, textTransform: "none" }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
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
          {/* Imagen grande (más ancha y completa) */}
          {images[currentIndex] && (
            <img
              src={images[currentIndex].url}
              alt={`banner-${images[currentIndex].id}`}
              style={{
                maxWidth: "96vw",
                maxHeight: "82vh",
                width: "100%",
                height: "auto",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 150ms ease",
                objectFit: "contain", // mostrar completa
                userSelect: "none",
                pointerEvents: "none",
                background: "rgba(0,0,0,0.2)",
              }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/1600x900?text=Imagen+no+disponible";
              }}
            />
          )}

          {/* Barra inferior de controles: grande y separada */}
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                bgcolor: "rgba(0,0,0,0.5)",
                p: 1,
                borderRadius: 2,
                backdropFilter: "blur(4px)",
              }}
            >
              <Tooltip title="Anterior">
                <span>
                  <IconButton
                    onClick={showPrev}
                    sx={{ color: "#fff", width: 48, height: 48 }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Zoom -">
                <span>
                  <IconButton
                    onClick={zoomOut}
                    sx={{ color: "#fff", width: 48, height: 48 }}
                  >
                    <ZoomOutIcon sx={{ fontSize: 26 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Reset">
                <span>
                  <IconButton
                    onClick={zoomReset}
                    sx={{ color: "#fff", width: 48, height: 48 }}
                  >
                    <RestartAltIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Zoom +">
                <span>
                  <IconButton
                    onClick={zoomIn}
                    sx={{ color: "#fff", width: 48, height: 48 }}
                  >
                    <ZoomInIcon sx={{ fontSize: 26 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Siguiente">
                <span>
                  <IconButton
                    onClick={showNext}
                    sx={{ color: "#fff", width: 48, height: 48 }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Cerrar">
                <span>
                  <IconButton
                    onClick={closeLightbox}
                    sx={{
                      color: "#fff",
                      width: 48,
                      height: 48,
                      bgcolor: "rgba(239, 68, 68, 0.6)",
                      "&:hover": { bgcolor: "rgba(239, 68, 68, 0.8)" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Carousel;