import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function LayoutInicio() {
  const [favoriteIds, setFavoriteIds] = useState([]);

  const loadFavorites = async () => {
    const token = localStorage.getItem("token");

    // Si no hay token, no intentes llamar a la API
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    try {
      const res = await fetch("https://localhost:4000/api/v1/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Manejo explícito de 401 sin loguear error en consola
      if (res.status === 401) {
        setFavoriteIds([]);
        return;
      }

      if (!res.ok) {
        setFavoriteIds([]);
        return;
      }

      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.favorites) ? data.favorites : []);
      setFavoriteIds(list.map((fav) => fav.id));
    } catch {
      // Silencioso para no ensuciar consola cuando no hay sesión
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <>
      <Header loadFavorites={loadFavorites} />
      <main>
        <Outlet context={{ favoriteIds, loadFavorites }} />
      </main>
      <Footer />
    </>
  );
}