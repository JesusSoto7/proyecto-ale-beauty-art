import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/favorite_toggle_button.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';

class InfoProduct extends StatelessWidget {
  final List<Product> products;

  const InfoProduct({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.68,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductDetailView(product: product),
              ),
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                  spreadRadius: 0,
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                  spreadRadius: 0,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Imagen con badge de descuento y botón favorito
                  Expanded(
                    child: Stack(
                      children: [
                        // Contenedor de imagen con fondo gris muy suave
                        Container(
                          width: double.infinity,
                          margin: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAFAFA),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: (product.imagenUrl?.isNotEmpty ?? false)
                                ? Image.network(
                                    product.imagenUrl!,
                                    fit: BoxFit.contain,
                                    errorBuilder: (_, __, ___) => Center(
                                      child: Icon(
                                        Icons.image_not_supported_outlined,
                                        size: 50,
                                        color: Colors.grey[300],
                                      ),
                                    ),
                                  )
                                : Center(
                                    child: Icon(
                                      Icons.image_outlined,
                                      size: 50,
                                      color: Colors.grey[300],
                                    ),
                                  ),
                          ),
                        ),

                        // 🎉 Badge de descuento con diseño premium
                        if (product.tieneDescuento)
                          Positioned(
                            top: 12,
                            left: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Color.fromARGB(255, 197, 78, 118),
                                    Color.fromARGB(255, 218, 55, 106),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: [
                                  BoxShadow(
                                    color:
                                        const Color.fromARGB(255, 241, 120, 160)
                                            .withOpacity(0.4),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.local_offer,
                                    color: Colors.white,
                                    size: 14,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '-${product.porcentajeDescuento}%',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                        // Botón de favoritos con fondo blanco
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: FavoriteToggleButton(
                              productId: product.id,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Información del producto con mejor espaciado
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Nombre del producto
                        Text(
                          product.nombreProducto,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: Color(0xFF2D2D2D),
                            height: 1.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),

                        // 💰 Precios con diseño mejorado
                        if (product.tieneDescuento)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Precio original tachado (mostrar con IVA incluido)
                              Text(
                                formatPriceCOP((product.precioProducto * 1.19).round()),
                                style: TextStyle(
                                  color: Colors.grey[500],
                                  fontSize: 12,
                                  decoration: TextDecoration.lineThrough,
                                  decorationColor: Colors.grey[400],
                                  decorationThickness: 1.5,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              // Precio con descuento destacado (IVA incluido)
                              Row(
                                children: [
                                  Text(
                                    formatPriceCOP((product.precioConMejorDescuento! * 1.19).round()),
                                    style: const TextStyle(
                                      color: Color(0xFFD95D85),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          )
                        else
                          Text(
                            // Precio en producto sin descuento (IVA incluido)
                            formatPriceCOP((product.precioProducto * 1.19).round()),
                            style: const TextStyle(
                              color: Color(0xFFD95D85),
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              letterSpacing: -0.5,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
