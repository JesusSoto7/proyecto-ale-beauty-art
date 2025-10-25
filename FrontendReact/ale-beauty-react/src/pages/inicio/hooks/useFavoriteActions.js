import { useCallback, useState, useEffect } from 'react';

export const useFavoriteActions = (token, loadFavorites, addAlert, favoriteIds, t) => {
  // Estado local para favoritos optimistas
  const [optimisticFavorites, setOptimisticFavorites] = useState(null);
  
  // ✅ Usar favoritos optimistas si existen, sino los reales, con fallback a array vacío
  const effectiveFavorites = optimisticFavorites !== null 
    ? optimisticFavorites 
    : (favoriteIds || []); // ✅ Fallback a array vacío
  
  // Sincronizar cuando cambien los favoritos reales
  useEffect(() => {
    if (favoriteIds && favoriteIds.length >= 0) {
      setOptimisticFavorites(null);
    }
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (productId) => {
    // ✅ Validación adicional
    if (!Array.isArray(effectiveFavorites)) {
      console.error('effectiveFavorites is not an array:', effectiveFavorites);
      return;
    }

    const wasFavorite = effectiveFavorites.includes(productId);
    
    // ✅ Actualizar estado optimista INMEDIATAMENTE
    const newOptimisticFavorites = wasFavorite
      ? effectiveFavorites.filter(id => id !== productId)
      : [...effectiveFavorites, productId];
    
    setOptimisticFavorites(newOptimisticFavorites);
    
    // ✅ Mostrar alerta inmediatamente
    addAlert(
      wasFavorite ? "Se eliminó de tus favoritos" : "Se agregó a tus favoritos",
      wasFavorite ? "warning" : "success",
      3500
    );

    // Hacer petición al servidor en background
    try {
      if (wasFavorite) {
        const res = await fetch(`https://localhost:4000/api/v1/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('Failed to remove favorite');
      } else {
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        
        const data = await res.json();
        if (!data.success) throw new Error('Failed to add favorite');
      }
      
      // ✅ Recargar favoritos del servidor para confirmar
      await loadFavorites();
      
    } catch (err) {
      console.error('Error toggling favorite:', err);
      
      // ✅ Revertir cambio optimista
      setOptimisticFavorites(null);
      await loadFavorites();
      
      addAlert("Algo salió mal, intenta de nuevo", "error", 3500);
    }
  }, [token, loadFavorites, addAlert, effectiveFavorites, t]);

  return { 
    toggleFavorite,
    effectiveFavorites // ✅ Siempre será un array
  };
};