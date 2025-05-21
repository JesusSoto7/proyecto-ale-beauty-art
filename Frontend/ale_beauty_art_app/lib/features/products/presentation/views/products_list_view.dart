import 'package:flutter/material.dart';
import '../../domain/models/product.dart';

class ProductsListView extends StatelessWidget {
  final List<Product> products;

  const ProductsListView({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lista de productos')),
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          final p = products[index];
          return ListTile(
            title: Text(p.name!),
            subtitle: Text(p.description!),
            trailing: Text('\$${p.price!.toStringAsFixed(2)}'),
          );
        },
      ),
    );
  }
}