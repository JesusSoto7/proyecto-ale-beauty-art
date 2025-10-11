import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';

class InfoProduct extends StatelessWidget {
  final List<Product> products;

  const InfoProduct({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.75,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductDetailView(productId: product.id),
              ),
            );
          },
          child: Card(
            elevation: 3,
            shadowColor: Colors.black26,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Imagen con fondo y botón favorito
                Expanded(
                  child: Stack(
                    children: [
                      // Fondo degradado con imagen
                      Container(
                        margin: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: Colors.white, // <-- Siempre blanco
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: (product.imagenUrl?.isNotEmpty ?? false)
                              ? Image.network(
                                  product.imagenUrl!,
                                  fit: BoxFit.contain,
                                  width: double.infinity,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(Icons.image_not_supported,
                                        size: 40, color: Colors.grey),
                                  ),
                                )
                              : const Center(
                                  child: Icon(Icons.image,
                                      size: 40, color: Colors.grey),
                                ),
                        ),
                      ),

                      // Botón de favoritos
                      Positioned(
                        top: 4,
                        right: 4,
                        child: Container(
                          child: IconButton(
                            icon: Icon(
                              // product.isFavorite ? Icons.favorite : Icons.favorite_border,
                              Icons.favorite_border,
                              color: Colors.grey,
                              // color: product.isFavorite ? Colors.red : Colors.grey,
                            ),
                            onPressed: () {
                              // TODO: Aquí colocas tu lógica de favorito
                              print("Favorito: ${product.nombreProducto}");
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Nombre del producto
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  child: Text(
                    product.nombreProducto,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),

                // Precio
                Padding(
                  padding: const EdgeInsets.only(left: 8, top: 3, bottom: 8),
                  child: Text(
                    formatPriceCOP(product.precioProducto),
                    style: AppTextStyles.price.copyWith(
                      color: Colors.pinkAccent,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
