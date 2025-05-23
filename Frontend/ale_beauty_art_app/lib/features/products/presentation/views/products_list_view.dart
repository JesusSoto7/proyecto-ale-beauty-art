import 'package:ale_beauty_art_app/features/products/presentation/widgets/info_product_widget.dart';
import 'package:flutter/material.dart';
import '../../domain/models/product.dart';
import 'package:ale_beauty_art_app/styles/colors.dart'; // para fondo
import 'package:ale_beauty_art_app/styles/text_styles.dart'; // si quieres títulos, etc

class ProductsListView extends StatelessWidget {
  final List<Product> products;

  const ProductsListView({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Productos',
          style: AppTextStyles.appBarTitle,
        ),
        centerTitle: true, 
        backgroundColor: AppColors.primaryPink,
        elevation: 4,
      ),

      body: InfoProduct(products: products),
    );
  }
}
