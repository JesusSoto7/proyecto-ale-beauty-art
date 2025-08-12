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
      title: Text(
        categoryName,
        style: const TextStyle(
          color: Colors.white, // texto blanco
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      automaticallyImplyLeading: false, // quita el back automático
      centerTitle: true, // centra el título
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        tooltip: '', // quita el texto flotante
        onPressed: () {
          Navigator.pop(context);
        },
      ),
    ),

      body: InfoProduct(products: products),
    );
  }
}
