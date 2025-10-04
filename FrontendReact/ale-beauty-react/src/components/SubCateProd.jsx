import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

export default function ProductsPageSubCategory({ token, t, lang }) {
  const { categoryId, subCategoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCategoryProducts() {
    try {
      setLoading(true);
      setError(null);

      const categoryRes = await fetch(
        `https://localhost:4000/api/v1/categories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
      }

      const productsRes = await fetch(
        `https://localhost:4000/api/v1/categories/${categoryId}/sub_categories/${subCategoryId}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
        console.log(`Fetched products for category = ${categoryId}. and subcategory = ${subCategoryId}:`);
      } else {
        throw new Error(t?.("categoryProducts.errorLoad") || "Error loading products");
      }
    } catch (error) {
      console.error("Error fetching category products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId, subCategoryId]);

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Typography variant="h5" sx={{ mb: 3, textTransform: "capitalize" }}>
            {category?.nombre_categoria || t?.("categoryProducts.title") || "Productos"}
          </Typography>

          {products.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              {t?.("categoryProducts.noProducts") || "No hay productos disponibles."}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    sx={{
                        width: "200px",
                        borderRadius: 2,
                        boxShadow: 3,
                        "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                        transition: "0.3s",
                    }}
                  >
                        <CardMedia
                        component="img"
                        height="200"
                        width="200"
                        image={product.imagen_url || "/placeholder.png"}
                        alt={product.nombre_producto}
                        sx={{ objectFit: "cover", width: '200px' }}
                        />
                    
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {product.nombre_producto}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.sub_category.nombre || "Sub Categoría"}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        ${product.precio_producto?.toLocaleString() || "0"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}
