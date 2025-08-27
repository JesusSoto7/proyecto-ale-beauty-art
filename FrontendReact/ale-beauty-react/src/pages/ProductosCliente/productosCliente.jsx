import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import IconButton from '@mui/joy/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import "../../assets/stylesheets/ProductosCliente.css";
import { formatCOP } from "../../services/currency";

function ProductosCliente() {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState(null);
  const { lang } = useParams();


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("https://localhost:4000/api/v1/products", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch('https://localhost:4000/api/v1/cart', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(data.cart))
      .catch(err => console.error('Error cargando carrito:', err));
  }, [token]);

  const addToCart = (productId) => {
    fetch('https://localhost:4000/api/v1/cart/add_product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.cart) {
          setCart(data.cart);
          alert('Producto añadido al carrito');
        } else if (data.errors) {
          alert('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto al carrito: ', err);
        alert('Error añadiendo producto al carrito');
      });
  };

  const addToFavorites = (productId) => {
    fetch('https://localhost:4000/api/v1/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Producto añadido a favoritos');
        } else if (data.errors) {
          alert('Error: ' + data.errors.join(", "));
        }
      })
      .catch(err => {
        console.error('Error añadiendo producto a favoritos: ', err);
        alert('Error añadiendo producto a favoritos');
      });
  };

  if (!token) return <p>No autenticado</p>;
  if (products.length === 0) return <p>No hay productos disponibles.</p>;

  return (
    <section className="mt-5">
      <h2 className="mb-4">Todos los productos</h2>
      <div className="productos-grid">
        {products.map(prod => (
          <div className="product-card" key={prod.id}>
            <Link
              to={`/${lang}/producto/${prod.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="image-container">
                <img
                  src={prod.imagen_url || "https://via.placeholder.com/250x200?text=Sin+imagen"}
                  alt={prod.nombre_producto}
                />
              </div>
              <h5>{prod.nombre_producto}</h5>
              <p>{formatCOP(prod.precio_producto)}</p>
            </Link>
            <div className="actions">
              <button onClick={() => addToCart(prod.id)}>Añadir al carrito</button>
              <IconButton onClick={() => addToFavorites(prod.id)}>
                <FavoriteBorder />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductosCliente;