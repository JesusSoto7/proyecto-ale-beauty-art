import { useState, useEffect, useCallback } from "react";

export const useProducts = (showAlert) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      showAlert("No está autenticado", "error");
    }
  }, [showAlert]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("https://localhost:4000/api/v1/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
      setIsError(false);
    } catch (error) {
      console.error("Error loading products:", error);
      setIsError(true);
      showAlert("Error al cargar productos", "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, showAlert]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("https://localhost:4000/api/v1/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, [token]);

  const fetchDiscounts = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("https://localhost:4000/api/v1/discounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading discounts:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
      fetchDiscounts();
    }
  }, [token, fetchProducts, fetchCategories, fetchDiscounts]);

  const createProduct = useCallback(
    async (formData) => {
      try {
        const response = await fetch("https://localhost:4000/api/v1/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          showAlert(`Error: ${errorData.error || response.statusText}`, "error");
          return false;
        }

        const newProduct = await response.json();
        setProducts((prev) => [...prev, newProduct]);
        showAlert("Producto creado exitosamente", "success");
        return true;
      } catch (error) {
        console.error("Error creating product:", error);
        showAlert("Error al crear el producto", "error");
        return false;
      }
    },
    [token, showAlert]
  );

  const updateProduct = useCallback(
    async (formData, slug) => {
      try {
        const response = await fetch(`https://localhost:4000/api/v1/products/${slug}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          showAlert(`Error: ${errorData.error || response.statusText}`, "error");
          return false;
        }

        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.slug === updatedProduct.slug ? updatedProduct : p))
        );
        showAlert("Producto actualizado exitosamente", "success");
        return true;
      } catch (error) {
        console.error("Error updating product:", error);
        showAlert("Error al actualizar el producto", "error");
        return false;
      }
    },
    [token, showAlert]
  );

  const deleteProduct = useCallback(
    async (slug) => {
      try {
        const response = await fetch(`https://localhost:4000/api/v1/products/${slug}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          showAlert(`Error: ${errorData.error || response.statusText}`, "error");
          return false;
        }

        setProducts((prev) => prev.filter((p) => p.slug !== slug));
        showAlert("Producto eliminado exitosamente", "success");
        return true;
      } catch (error) {
        console.error("Error deleting product:", error);
        showAlert("Error al eliminar el producto", "error");
        return false;
      }
    },
    [token, showAlert]
  );

  return {
    products,
    categories,
    discounts,
    isLoading,
    isError,
    token,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};