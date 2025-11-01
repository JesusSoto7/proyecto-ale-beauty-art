import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ImageUpload = ({ currentImage, onImageChange, isDark }) => {
  const [preview, setPreview] = useState(currentImage);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 3,
        border: `2px dashed ${isDark ? "#444" : "#e0e0e0"}`,
        borderRadius: "12px",
        backgroundColor: isDark ? "#1a1a2e" : "#f9fafb",
      }}
    >
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            borderRadius: "12px",
            border: `2px solid ${isDark ? "#444" : "#e0e0e0"}`,
          }}
        />
      )}

      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadIcon />}
        sx={{
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {preview ? "Cambiar imagen" : "Seleccionar imagen"}
        <input type="file" accept="image/*" onChange={handleFileChange} hidden />
      </Button>

      <Typography variant="caption" sx={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
        Formatos: JPG, PNG, GIF (Máx. 5MB)
      </Typography>
    </Box>
  );
};

export default ImageUpload;