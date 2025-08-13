import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../models/product.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/core/utils/formatters.dart';

class ProductDetailView extends StatefulWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  bool _isImageLoaded = false;

  void _markImageLoaded() {
    if (!_isImageLoaded && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _isImageLoaded = true);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 255, 238, 243),
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back,
            color: Color.fromARGB(255, 248, 174, 174),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Align(
          alignment: Alignment.center,
          child: Text(
            'Product Details',
            style: const TextStyle(
              color: Color.fromARGB(255, 248, 174, 174), // texto blanco
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border, color: Colors.grey),
            onPressed: () {
              print("Favorito: ${product.nombreProducto}");
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ----------------------
            // Contenedor imagen + shimmer
            // ----------------------
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  height: 260,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: _isImageLoaded ? Colors.white : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: (product.imagenUrl != null &&
                          product.imagenUrl!.isNotEmpty)
                      ? Stack(
                          children: [
                            // Imagen (abajo)
                            Positioned.fill(
                              child: Image.network(
                                product.imagenUrl!,
                                fit: BoxFit.fitHeight,
                                // frameBuilder nos dice cuando llega el primer frame (imagen visible)
                                frameBuilder:
                                    (context, child, frame, wasSynchronouslyLoaded) {
                                  if (wasSynchronouslyLoaded) {
                                    // imagen desde cache: marcar como cargada
                                    _markImageLoaded();
                                    return child;
                                  }
                                  if (frame == null) {
                                    // aún no hay frame -> no retornamos el child para que el shimmer se vea
                                    return const SizedBox.shrink();
                                  } else {
                                    // primer frame recibido -> marcar y mostrar imagen
                                    _markImageLoaded();
                                    return child;
                                  }
                                },
                                errorBuilder:
                                    (context, error, stackTrace) {
                                  // marcar como "cargada" para quitar el shimmer y mostrar fallback
                                  _markImageLoaded();
                                  return const Center(
                                    child: Text(
                                      '💋',
                                      style: TextStyle(
                                        fontSize: 64,
                                        color: AppColors.primaryPink,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),

                            // Shimmer (encima) — visible solo mientras no esté cargada
                            if (!_isImageLoaded)
                              Positioned.fill(
                                child: Shimmer.fromColors(
                                  baseColor: Colors.grey.shade300,
                                  highlightColor: Colors.grey.shade100,
                                  child: Container(
                                    // mantener el mismo tamaño para evitar saltos
                                    height: 260,
                                    width: double.infinity,
                                    color: Colors.grey.shade300,
                                  ),
                                ),
                              ),
                          ],
                        )
                      // fallback cuando no hay URL
                      : const Center(
                          child: Text(
                            '💋',
                            style: TextStyle(
                              fontSize: 64,
                              color: AppColors.primaryPink,
                            ),
                          ),
                        ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Nombre y precio
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  product.nombreProducto,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1F2937),
                  ),
                ),
                Text(
                  formatPriceCOP(product.precioProducto),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryPink,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Badge categoría
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.pink.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                product.nombreCategoria,
                style: const TextStyle(
                  color: AppColors.primaryPink,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
            
            // Descripción
            Text(
              product.descripcion,
              style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF374151),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),

      // Botones
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            SizedBox(
              width: 56,
              height: 56,
              child: OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  side:
                      const BorderSide(color: AppColors.primaryPink, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: EdgeInsets.zero,
                ),
                child: const Icon(
                  Icons.add_shopping_cart,
                  color: AppColors.primaryPink,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryPink,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 23),
                ),
                child: const Text(
                  "Comprar ahora",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
