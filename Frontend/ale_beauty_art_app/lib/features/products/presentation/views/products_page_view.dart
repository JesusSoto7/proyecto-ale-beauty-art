import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
import 'package:flutter/material.dart';
import '../../domain/models/products.dart';

class ProductsPage extends StatelessWidget {
  final List<Product> products;

  const ProductsPage({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return ProductsListView(products: products);
  }
}
