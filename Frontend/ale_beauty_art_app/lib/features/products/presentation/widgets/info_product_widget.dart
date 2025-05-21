import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/features/products/domain/models/product.dart';

class InfoProduct extends StatelessWidget {
  final List<Product> products;

  const InfoProduct({super.key, required this.products}); 

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          final p = products[index];
          return ListTile(
            title: Text(p.name ?? 'Sin nombre'),
            subtitle: Text(p.description ?? 'Sin descripción'),
            trailing: Text('\$${p.price?.toStringAsFixed(2) ?? '0.00'}'),
          );
        },
      ),
    );
  }
}
