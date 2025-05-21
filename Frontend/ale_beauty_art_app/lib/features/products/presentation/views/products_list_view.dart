import 'package:ale_beauty_art_app/features/products/presentation/widgets/info_product_widget.dart';

import 'package:flutter/material.dart';
import '../../domain/models/product.dart';

class ProductsListView extends StatelessWidget {
  final List<Product> products;

  const ProductsListView({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(child:InfoProduct(products: products),
          ),
        ],
      ),
    );
  }
}