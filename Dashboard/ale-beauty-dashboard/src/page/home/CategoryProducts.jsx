import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import "../../assets/stylesheets/categoriasHome.css";

const CategoryProducts = () => {
  const { id } = useParams(); // viene de /categoria/:id
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    // traer productos filtrados por categoría
    fetch(`https://localhost:4000/api/v1/products?category_id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando productos", err));

    // traer info de la categoría
    fetch(`https://localhost:4000/api/v1/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCategoria(data))
      .catch((err) => console.error("Error cargando categoría", err));
  }, [id, token]);

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        {categoria ? categoria.nombre_categoria : "Cargando..."}
      </h2>

      {productos.length === 0 ? (
        <p style={{ textAlign: "center" }}>No hay productos en esta categoría.</p>
      ) : (
        <div
          style={{
            display: "flex",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {productos.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#242424",
                color: "black",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                minWidth: "200px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <Link
                to={`/producto/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit", flex: 1 }}
              >
                <img
                  src={
                    p.imagen_url ||
                    "https://via.placeholder.com/250x200?text=Sin+imagen"
                  }
                  alt={p.nombre_producto}
                  style={{ width: "100%", height: "200px", objectFit: "contain", background: "#ffff"}}
                />
                <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ margin: "0 0 10px", fontSize: "18px", lineHeight: "1.2em", color: "#beb5b5" }}>
                      {p.nombre_producto}
                    </h4>
                    <p style={{ margin: "0 0 5px", fontWeight: "bold", fontSize: "16px", color: "#beb5b5"}}>
                      ${p.precio_producto}
                    </p>
                  </div>
                  <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                    Stock: {p.stock}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
