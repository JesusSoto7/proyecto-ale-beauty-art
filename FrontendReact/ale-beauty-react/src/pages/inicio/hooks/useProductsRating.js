import { useState, useCallback } from 'react';

export const useProductRatings = (token) => {
  const [productRatings, setProductRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(false);

  // ✅ Cargar ratings de forma optimizada (en paralelo)
  const loadRatings = useCallback(async (productList) => {
    if (!productList || productList.length === 0) return;
    
    setLoadingRatings(true);

    try {
      // ✅ Hacer TODAS las peticiones en paralelo con Promise.all
      const ratingsPromises = productList.map(async (product) => {
        try {
          const res = await fetch(
            `https://localhost:4000/api/v1/products/${product.slug}/reviews`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const reviews = await res.json();

          if (Array.isArray(reviews) && reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            return {
              id: product.id,
              avg,
              count: reviews.length
            };
          }
          return {
            id: product.id,
            avg: 0,
            count: 0
          };
        } catch (error) {
          console.error(`Error loading rating for product ${product.id}:`, error);
          return {
            id: product.id,
            avg: 0,
            count: 0
          };
        }
      });

      // ✅ Esperar a que TODAS las peticiones terminen
      const results = await Promise.all(ratingsPromises);

      // ✅ Actualizar estado UNA SOLA VEZ con todos los resultados
      const ratingsMap = results.reduce((acc, result) => {
        acc[result.id] = { avg: result.avg, count: result.count };
        return acc;
      }, {});

      setProductRatings(prev => ({ ...prev, ...ratingsMap }));
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  }, [token]);

  return {
    productRatings,
    loadingRatings,
    loadRatings
  };
};