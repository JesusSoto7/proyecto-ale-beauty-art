import 'package:ale_beauty_art_app/features/products/presentation/widgets/info_product_widget.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import '../../../../models/product.dart';

class ProductsListView extends StatelessWidget {
  final List<Product> products;

  const ProductsListView({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: const Color.fromARGB(255, 245, 245, 245),
      body: InfoProduct(products: products),
    );
  }
}
