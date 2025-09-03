import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function LayoutInicio() {
  const [favoriteIds, setFavoriteIds] = useState([]);

  const loadFavorites = async () => {
    try {
      const res = await fetch("https://localhost:4000/api/v1/favorites", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setFavoriteIds(data.map(fav => fav.id));
    } catch (err) {
      console.error("Error cargando favoritos:", err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <>
      {/* ✅ Header puede cerrar modal y recargar favoritos */}
      <Header loadFavorites={loadFavorites} />

      <main>
        {/* ✅ Outlet pasa favoritos y la función a las vistas hijas (Inicio, etc.) */}
        <Outlet context={{ favoriteIds, loadFavorites }} />
      </main>

      <Footer />
    </>
  );
}
