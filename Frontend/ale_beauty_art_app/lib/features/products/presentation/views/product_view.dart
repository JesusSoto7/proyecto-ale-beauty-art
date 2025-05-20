import 'package:flutter/material.dart';

class ProductView extends StatelessWidget {
  const ProductView({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter inicio'),
      ),
      body: Center(
        child: Text('Hola inicio'),
      ),
    );
  }
}