
import 'package:flutter/material.dart';
import '../../../../models/product.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

class ProductDetailView extends StatelessWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primaryPink,
        // Esto asegura que Flutter no ponga su back automático
        automaticallyImplyLeading: false,
        // Flecha personalizada
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          tooltip: '', // evita que salga el texto flotante
          onPressed: () {
            Navigator.pop(context); // vuelve atrás
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen con degradado
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  height: 260,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.pink.shade100,
                        Colors.pinkAccent.shade100,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: product.imagenUrl != null && product.imagenUrl!.isNotEmpty
                      ? Image.network(
                          product.fullImageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Center(
                            child: Text(
                              '💋',
                              style: TextStyle(
                                fontSize: 64,
                                color: AppColors.primaryPink,
                              ),
                            ),
                          ),
                        )
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
            const SizedBox(height: 20),

            // Badge de categoría
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
            const SizedBox(height: 12),

            // Nombre del producto
            Text(
              product.nombreProducto,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 8),

            // Precio
            Text(
              '\$${product.precioProducto}',
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primaryPink,
              ),
            ),
            const SizedBox(height: 20),

            // Descripción
            Text(
              product.descripcion,
              style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF374151), // 👈 más oscuro para mejor contraste
                height: 1.4,
              ),
            ),
            const SizedBox(height: 80), // Espacio para los botones fijos
          ],
        ),
      ),

      // Botones fijos al final
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Botón Comprar ahora
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: lógica de "Comprar ahora"
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryPink,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
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
            const SizedBox(height: 8),
            // Botón Agregar al carrito
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  // TODO: lógica de "Agregar al carrito"
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primaryPink, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  "Agregar al carrito",
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.primaryPink,
                    fontWeight: FontWeight.bold,
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
