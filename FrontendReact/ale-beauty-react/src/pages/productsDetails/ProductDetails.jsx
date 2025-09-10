import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/joy/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import "../../assets/stylesheets/ProductDetails.css";
import { formatCOP } from "../../services/currency";
import { BsCart4 } from "react-icons/bs";
import Skeleton from "@mui/joy/Skeleton";
import noImage from "../../assets/images/no_image.png";
import { useOutletContext } from "react-router-dom";


function ProductDetails() {
  const { slug } = useParams();
  const { lang } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [token] = useState(localStorage.getItem("token"));
  const [cart, setCart] = useState(null);
  const { favoriteIds, loadFavorites } = useOutletContext();
  const { t } = useTranslation();
  const isFavorite = product ? favoriteIds.includes(product.id) : false;

  // Cargar producto + carrito + favoritos
  useEffect(() => {
    if (!token) {
      alert(t('productDetails.notAuthenticated'));
      return;
    }

    // cargar producto
    fetch(`https://localhost:4000/api/v1/products/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);

        fetch("https://localhost:4000/api/v1/products", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((allProducts) => {
            // console.log("Todos los productos:", allProducts);
            const filtered = allProducts
              .filter((p) => p.category_id === data.category_id && p.id !== data.id)
              .slice(0, 5);
              // console.log(allProducts[0])
            // console.log("Relacionados filtrados:", filtered);
            setRelatedProducts(filtered);
          })
          .catch((err) => console.error("Error cargando relacionados:", err));

      })
      .catch((err) => console.error(err));

    // cargar carrito
    fetch("https://localhost:4000/api/v1/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch((err) =>
        console.error(t('productDetails.cartError'), err)
      );
  }, [slug, token, t]);

  function ProductImage({ product, noImage }) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
      <div className="product-image" style={{ position: "relative" }}>
        {!imgLoaded && (
          <Skeleton
            variant="rectangular"
            width={"400px"}
            height={400}
            sx={{ position: "absolute", top: 0, left: 100 }}
          />
        )}

        <img
          src={product.imagen_url || noImage}
          alt={product.nombre_producto}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = noImage;
            setImgLoaded(true);
          }}
        />
      </div>
    );
  }

  if (!product) return <p>{t('productDetails.loading')}</p>;

  const activeBtnStyle = {
    borderBottom: "2px solid #f896b8",
    fontWeight: "bold",
    color: "#f896b8",
  };

  function ProductRating({ value = 0, count = 0 }) {
    return (
      <Box display="flex" alignItems="center">
        <Rating
          name="product-rating"
          value={Number(value) || 0}
          precision={0.5}
          readOnly
          sx={{
            color: "#f896b8", // color rosa
          }}
        />
        <Typography variant="body2" sx={{ ml: 1 }}>
          ({Number(value).toFixed(1)}) ({count})
        </Typography>
      </Box>
    );
  }

  function ProductDescription({ description }) {
    const limit = 150; // número de caracteres a mostrar

    if (!description) return null; // evita error si es null o undefined

    const shortText =
      description.length > limit
        ? description.substring(0, limit) + "..."
        : description;

    const handleScroll = () => {
      const detailsSection = document.getElementById("detalles-producto");
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: "smooth" });
      }
    };

    return (
      <p style={{ lineHeight: "1.5", fontSize: "16px", overflowWrap: "anywhere", marginBottom: "0", marginTop: "10px" }}>
        {shortText}
        {description.length > limit && (
          <a
            href="#detalles-producto"
            onClick={(e) => {
              e.preventDefault();
              handleScroll();
            }}
            style={{
              marginLeft: "8px",
              color: "#f896b8",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            Ver más
          </a>
        )}
      </p>
    );
  }


  // --- funciones de acciones ---
  const addToCart = (productId) => {
    fetch("https://localhost:4000/api/v1/cart/add_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) {
          setCart(data.cart);
          alert(t('productDetails.addedToCart'));
        } else if (data.errors) {
          alert(t('productDetails.error') + data.errors.join(", "));
        }
      })
      .catch((err) => {
        console.error(t('productDetails.cartAddError'), err);
        alert(t('productDetails.cartAddError'));
      });
  };

  // ✅ toggle favoritos
  const toggleFavorite = async (productId) => {
    try {
      if (favoriteIds.includes(productId)) {
        // ❌ quitar favorito
        const res = await fetch(
          `https://localhost:4000/api/v1/favorites/${productId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      } else {
        // ❤️ añadir favorito
        const res = await fetch("https://localhost:4000/api/v1/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const data = await res.json();
        if (data.success) {
          await loadFavorites(); // 🔄 refresca favoritos globales
        }
      }
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
    }
  };


  return (
    <div className="product-details-page">
      <div className="product-container">
        <ProductImage product={product} noImage={noImage} />

        <div className="product-info">
          <div className="title-category">
            <p className="negrita">{product.category.nombre_categoria}</p>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"
             }}>
              <h2>{product.nombre_producto}</h2>

              <IconButton id="favBtn" onClick={() => toggleFavorite(product.id)}>
                {isFavorite ? (
                  <Favorite sx={{ color: "white" }} />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            </div>
            
          </div>
          {/* componente de rating */}
          <ProductRating value={5.0} count={9} />
          {/* <ProductRating value={product.promedio_rating} count={product.total_reviews} /> */}


          <ProductDescription description={product.descripcion} />
          <p style={{color: "#ccc"}}>Disponibles: {product.stock}</p>
          <p className="price"> {formatCOP(product.precio_producto)}</p>

          {/* botones de acción */}
          <div className="actions">
            <button onClick={() => addToCart(product.id)}>
              comprar ahora
            </button>

            <button onClick={() => addToCart(product.id)}>
              <BsCart4 size={25} />
            </button>
          </div>
        </div>
      </div>

      <section id="detalles-producto" className="datails-section">
        <div className="description-section">
          <div style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
              <button style={activeBtnStyle}>
                Descripción
              </button>
              <button>Reseñas</button>
          </div>
          <p style={{ color: '#3d3d3dff', overflowWrap: "anywhere"}}>{product.descripcion}</p>
        </div>
        <div style={{ paddingTop: "10px"}} className="additional-info">
          <h5 style={{ color: '#f896b8'}}>información adicional</h5>
          <ul>
            <li>{t('productDetails.info1')}</li>
            <li>{t('productDetails.info2')}</li>
          </ul>
        </div>
        
      </section>

      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <h3 style={{display: "flex", justifySelf: "center"}}>Productos relacionados</h3>
          <hr style={{display: "flex", justifySelf: "center", width: "70%", color: "#ccc"}}></hr>
          <div className="carousel-container">
            <div className="carousel-items">
              {relatedProducts.map((rp) => (
                <div className="product-card" key={rp.id} style={{ position: "relative" }}>
                  
                  {/* Botón de favorito */}
                  <IconButton
                    onClick={() => toggleFavorite(rp.id)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      "&:hover": { bgcolor: "grey.200" },
                    }}
                  >
                    {favoriteIds.includes(rp.id) ? (
                      <Favorite sx={{ color: "#ffffffff" }} />
                    ) : (
                      <FavoriteBorder />
                    )}

                  </IconButton>

                  {/* Enlace al producto */}
                  <Link
                    to={`/${lang}/producto/${rp.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="image-container">
                      <img
                        src={rp.imagen_url || noImage}
                        alt={rp.nombre_producto}
                        onError={(e) => {
                          e.currentTarget.src = noImage;
                        }}
                      />
                    </div>
                    <h5>{rp.nombre_producto}</h5>
                    <p>{formatCOP(rp.precio_producto)}</p>
                  </Link>

                  {/* Botón de agregar al carrito */}
                  <div className="actions">
                    <button onClick={() => addToCart(rp.id)}>
                      {t('home.addToCart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="related-products">
          <h3 style={{display: "flex", justifySelf: "center"}}>Productos relacionados</h3>
          <hr style={{display: "flex", justifySelf: "center", width: "70%", color: "#ccc"}}></hr>
          {/* Skeletons mientras carga */}
          <div className="carousel-container">
            <div className="carousel-items">
              {[1, 2, 3, 4, 5].map((skeleton) => (
                <div className="product-card" key={skeleton}>
                  <div className="image-container">
                    <Skeleton variant="rectangular" width={"100%"} height={200} />
                  </div>
                  <Skeleton variant="text" width={150} height={30} />
                  <Skeleton variant="text" width={80} height={20} />
                  <div className="actions">
                    <Skeleton variant="rectangular" width={120} height={36} />
                    <Skeleton variant="circular" width={36} height={36} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
}

export default ProductDetails;