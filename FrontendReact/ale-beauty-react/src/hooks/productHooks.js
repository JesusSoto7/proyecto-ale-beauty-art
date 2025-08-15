import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "https://localhost:4000/api/v1";

const getToken = () => localStorage.getItem("token");

const axiosInstance = () =>
  axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

// Obtener productos
export const useGetProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axiosInstance().get("/products");
      return data;
    },
  });
};

// Crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct) => {
      const { data } = await axiosInstance().post("/products", newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updatedProduct }) => {
      const { data } = await axiosInstance().put(`/products/${id}`, updatedProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosInstance().delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
