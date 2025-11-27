import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import IconButton from '@mui/joy/IconButton';
import { formatCOP } from '../services/currency';
import GradientHeart from '../components/GradientHeart';
import noImage from "../assets/images/no_image.png";

const ProductCard = memo(({
  product,
  lang,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  productRating,
  t
}) => {
  // Calcular porcentaje de descuento
  const getDiscountPercentage = () => {
    if (product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto) {
      const discount = ((product.precio_producto - product.precio_con_mejor_descuento) / product.precio_producto) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const discountPercentage = getDiscountPercentage();

  return (
    <div className="product-card-v3">
      {/* Badge de descuento - Arriba a la izquierda */}
      {discountPercentage && (
        <div className="discount-badge-v3">
          <span className="discount-percentage">-{discountPercentage}%</span>
        </div>
      )}

      <div className="product-image-container-v3">
        <img
          src={product.imagen_url || noImage}
          alt={product.nombre_producto}
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.src = noImage; }}
          className="product-image-v3"
        />

        {/* Botón de favoritos - Arriba a la derecha */}
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="favorite-btn-v3"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "50%",
            zIndex: 3,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "white",
              transform: "scale(1.1)",
              boxShadow: "0 6px 20px rgba(217, 93, 133, 0.3)",
            }
          }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <GradientHeart filled={isFavorite} size={28} />
        </IconButton>

        {/* Overlay con efecto hover */}
        <div className="image-overlay-v3"></div>
      </div>

      <Link to={`/${lang}/producto/${product.slug}`} className="product-link-v3">
        <div className="product-info-v3">
          <h3 className="product-name-v3">{product.nombre_producto}</h3>

          {/* Rating con estrellas */}
          <div className="rating-row-v3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFA726" className="star-icon">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="rating-number-v3">
              {productRating?.avg ? Number(productRating.avg).toFixed(1) : "5.0"}
            </span>
            <span className="rating-count-v3">
              ({productRating?.count || "0"})
            </span>
          </div>

          {/* Precios */}
          <div className="price-container-v3">
            {(() => {
              const base = product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto
                ? product.precio_con_mejor_descuento
                : product.precio_producto;
              // Use server-provided IVA/price-with-IVA when present, otherwise fallback to local calc
              const ivaPerUnit = (product.iva_amount !== undefined && product.iva_amount !== null) ? product.iva_amount : Math.round(base * 0.19 * 100) / 100;
              const precioConIva = (product.precio_con_iva !== undefined && product.precio_con_iva !== null) ? product.precio_con_iva : (base + ivaPerUnit);

              return (
                <>
                  <span className="price-current-v3">{formatCOP(precioConIva)}</span>
                  {product.precio_con_mejor_descuento && product.precio_con_mejor_descuento < product.precio_producto ? (
                      <span className="price-original-v3">{formatCOP(product.precio_producto_con_iva ?? Math.round(product.precio_producto * 1.19))}</span>
                  ) : null}
                </>
              );
            })()}
          </div>

          {/* Nombre del descuento */}
          {product.mejor_descuento_para_precio && (
            <div className="discount-label-v3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "4px" }}>
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
              </svg>
              {product.mejor_descuento_para_precio.nombre}
            </div>
          )}
        </div>
      </Link>

      {/* Botón agregar al carrito */}
      <div className="card-footer-v3">
        {product.stock > 0 ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="add-to-cart-btn-v3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "6px" }}>
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            {t('home.addToCart')}
          </button>
        ) : (
          <button className="add-to-cart-btn-v3 out-of-stock-btn" disabled>
            {t('home.outOfStock') || 'Sin stock'}
          </button>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;