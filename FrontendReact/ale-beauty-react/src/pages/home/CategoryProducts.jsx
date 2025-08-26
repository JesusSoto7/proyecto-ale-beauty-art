import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const CategoryProducts = () => {
  const { id } = useParams(); // viene de /categoria/:id
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    // traer productos de la categoría
    fetch(`https://localhost:4000/api/v1/categories/${id}/products`, {
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
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>
        {categoria ? categoria.nombre_categoria : "Cargando..."}
      </h2>

      {productos.length === 0 ? (
        <p>No hay productos en esta categoría.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {productos.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                overflow: "hidden",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Link
                to={`/producto/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={
                    p.imagen_url ||
                    "https://via.placeholder.com/250x200?text=Sin+imagen"
                  }
                  alt={p.nombre_producto}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
                <div style={{ padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "18px" }}>
                    {p.nombre_producto}
                  </h4>
                  <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>
                    ${p.precio_producto}
                  </p>
                  <p style={{ fontSize: "14px", color: "#666" }}>
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
