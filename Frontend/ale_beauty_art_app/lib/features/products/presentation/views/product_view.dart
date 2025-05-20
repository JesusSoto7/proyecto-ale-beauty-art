import 'package:flutter/material.dart';

class ProductView extends StatelessWidget {
  const ProductView({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('JOA '),
      ),
      body: Center(
        child: Text('Este es el producto'),
      ),
    );
  }
}