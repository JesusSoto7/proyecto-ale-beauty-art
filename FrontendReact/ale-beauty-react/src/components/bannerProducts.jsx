import React from "react";
import Rating from "@mui/material/Rating";

function BannerProduct({ product }) {
  if (!product) return null;

  return (
    <div
      style={{
        backgroundColor: "#df6897",
        width: "90%",
        height: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        borderRadius: "10px",
        overflow: "hidden",
        margin: "auto",
        position: "relative",
        border: "solid 1px #ffd8e4ff"
      }}
    >
        <div style={{
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                backgroundColor: "#ffffffff",
                width: "35%",
                height: "120%",
                borderRadius: "60%",
                boxShadow: "0px 1px 65px 0px rgba(173, 58, 129, 0.88)"
            }}>
                
            <img
                src={product.imagen_url}
                alt={product.nombre || "Producto"}
                style={{ width: "70%",  objectFit: "cover", borderRadius: 100, transition: "2s" }}
            /> 
        </div>
        <div style={{
                width: "50%",
                height: "100%",
                // backgroundColor: "red",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                justifyContent: "space-around"
            }}>
            <h1 style={{color: "#fff", fontSize: 60}}>{product.name}</h1>
            <Rating value={product.rating || 0}/>
            <button style={{width: "20%"}}>ver detalles</button>
        </div>
        
      
    </div>
  );
}

export default BannerProduct;
