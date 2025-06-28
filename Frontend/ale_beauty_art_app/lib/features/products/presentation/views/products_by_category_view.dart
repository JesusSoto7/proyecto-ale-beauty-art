import 'package:flutter/material.dart';
import '../../../../models/product.dart';
import '../../../../styles/colors.dart';
import '../widgets/info_product_widget.dart';

class ProductsByCategoryView extends StatelessWidget {
  final int categoryId;
  final String categoryName;
  final List<Product> products;

  const ProductsByCategoryView({
    super.key,
    required this.categoryId,
    required this.categoryName,
    required this.products,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Productos de $categoryName'),
        backgroundColor: AppColors.primaryPink,
      ),
      body: InfoProduct(products: products),
    );
  }
}
