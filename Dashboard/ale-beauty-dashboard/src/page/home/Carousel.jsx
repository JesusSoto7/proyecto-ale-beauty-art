import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import "./../../assets/stylesheets/home.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:4000";
const DEFAULT_SKELETON_COUNT = 3; // NEW: fallback para la primera visita

function Carousel() {
  // Estado principal
  const [images, setImages] = useState([]); // [{ id, url }]
  const [savingOrder, setSavingOrder] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // NEW: cantidad de skeletons a pintar mientras carga la lista (usa último conteo conocido)
  const [skeletonCount, setSkeletonCount] = useState(() => {
    const stored = Number(localStorage.getItem("carousel_last_count"));
    return Number.isFinite(stored) && stored >= 0 ? stored : DEFAULT_SKELETON_COUNT;
  });

  // Upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Drag & Drop reorder refs
  const dragFromIndex = useRef(null);
  const dragOverIndex = useRef(null);

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

      // NEW: actualiza el conteo real y persiste para el próximo “primer paint”
      const count = list.length;
      setSkeletonCount(count);
      localStorage.setItem("carousel_last_count", String(count));
    } catch (err) {
      console.error("Error cargando imágenes del carrusel:", err);
      // NEW: en error no tocamos skeletonCount (dejamos el último conocido)
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

  // Limpieza del preview si cambia el file
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
    if (uploading || savingOrder) return;
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

  // Persistir orden
  const persistOrder = async (newImages) => {
    try {
      setSavingOrder(true);
      const orderIds = newImages.map((img) => img.id);
      const res = await fetch(`${API_BASE}/api/v1/carousel/reorder`, {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order: orderIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("Error reordenando: " + (data.errors ? data.errors.join(", ") : res.statusText));
        await loadImages(); // revert
      } else {
        setImages(newImages);
        // NEW: actualiza conteo por si cambió (no debería cambiar aquí, pero por seguridad)
        setSkeletonCount(newImages.length);
        localStorage.setItem("carousel_last_count", String(newImages.length));
        window.dispatchEvent(new CustomEvent("carousel:updated"));
      }
    } catch (err) {
      console.error("Error reordenando", err);
      alert("Error reordenando. Revisa consola.");
      await loadImages();
    } finally {
      setSavingOrder(false);
    }
  };

  // Drag & Drop tarjetas
  const handleDragStart = (index) => (e) => {
    dragFromIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };
  const handleDragEnter = (index) => (e) => {
    dragOverIndex.current = index;
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };
  const handleDragOver = () => (e) => e.preventDefault();
  const handleDragLeave = () => (e) => e.currentTarget.classList.remove("drag-over");
  const handleDrop = (index) => async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const from = dragFromIndex.current;
    const to = dragOverIndex.current ?? index;
    dragFromIndex.current = null;
    dragOverIndex.current = null;
    document.querySelectorAll(".banner-card.dragging").forEach((el) => el.classList.remove("dragging"));
    if (from === null || from === to) return;
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setImages(reordered);
    await persistOrder(reordered);
  };
  const handleDragEnd = (e) => e.currentTarget.classList.remove("dragging");

  const moveUp = (index) => async () => {
    if (index === 0 || savingOrder) return;
    const reordered = [...images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setImages(reordered);
    await persistOrder(reordered);
  };
  const moveDown = (index) => async () => {
    if (index === images.length - 1 || savingOrder) return;
    const reordered = [...images];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setImages(reordered);
    await persistOrder(reordered);
  };

  // Card con skeleton por imagen hasta onLoad
  const BannerCard = ({ img, idx }) => {
    const [loaded, setLoaded] = useState(false);
    const onError = (e) => {
      if (!e.currentTarget.dataset.fallbackApplied) {
        e.currentTarget.dataset.fallbackApplied = "1";
        e.currentTarget.src = "https://placehold.co/1280x720?text=Imagen+no+disponible";
      } else {
        setLoaded(true); // evita skeleton infinito si el placeholder también falla
      }
    };

    return (
      <div
        className="banner-card"
        draggable
        onDragStart={handleDragStart(idx)}
        onDragEnter={handleDragEnter(idx)}
        onDragOver={handleDragOver(idx)}
        onDragLeave={handleDragLeave(idx)}
        onDrop={handleDrop(idx)}
        onDragEnd={handleDragEnd}
      >
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

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1, flexWrap: "wrap" }}
        >
          <Tooltip title="Arrastrar para reordenar">
            <IconButton size="small">
              <DragIndicatorIcon />
            </IconButton>
          </Tooltip>
          <small style={{ color: "#64748b" }}>Posición: {idx + 1}</small>
        </Stack>

        <div className="banner-actions">
          <Button
            variant="outlined"
            color="primary"
            onClick={moveUp(idx)}
            disabled={idx === 0 || savingOrder}
            sx={{ textTransform: "none" }}
          >
            ↑
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={moveDown(idx)}
            disabled={idx === images.length - 1 || savingOrder}
            sx={{ textTransform: "none" }}
          >
            ↓
          </Button>
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
          disabled={uploading || savingOrder}
        >
          {uploading ? "Subiendo..." : "Subir"}
        </button>

        {uploadSuccess && (
          <div className="success-message" role="status">
            <span className="check">✔</span> Archivo subido correctamente
          </div>
        )}
      </div>

      {/* Lista y reorden */}
      <div className="banners-list">
        <div className="banners-header">
          <h3>Imágenes del carrusel</h3>
          <div style={{ display: "flex", gap: 12 }}>
            {savingOrder && (
              <span className="loading-inline">
                <CircularProgress size={14} /> Guardando orden…
              </span>
            )}
          </div>
        </div>

        <div className="banners-grid">
          {/* NEW: mientras está cargando, pinta skeletons usando el último conteo conocido */}
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
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width={90} height={20} />
                </Stack>
                <div className="banner-actions" style={{ gap: 12, display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                  <Skeleton variant="rectangular" width={64} height={36} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={64} height={36} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={110} height={40} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width={110} height={40} sx={{ borderRadius: 1 }} />
                </div>
              </div>
            ))}

          {/* Cuando termina de cargar y no hay imágenes */}
          {!loadingList && images.length === 0 && (
            <div className="empty-state">No hay imágenes todavía. Sube la primera arriba.</div>
          )}

          {/* Cuando termina de cargar, muestra cada card con su propio skeleton hasta onLoad */}
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
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 150ms ease",
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