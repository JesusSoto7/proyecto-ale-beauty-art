
import 'package:flutter/material.dart';
import '../../domain/models/product.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

class ProductDetailView extends StatelessWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(product.name),
        backgroundColor: AppColors.primaryPink,
      ),
      backgroundColor: AppColors.background,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen del producto
            Center(
              child: Image.network(
                product.imageUrl,
                height: 200,
              ),
            ),
            const SizedBox(height: 20),
            // Nombre
            Text(
              product.name,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            // Precio
            Text(
              '\$${product.price}',
              style: const TextStyle(fontSize: 18, color: AppColors.primaryPink),
            ),
            const SizedBox(height: 10),
            // Descripción
            Text(
              product.description,
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}