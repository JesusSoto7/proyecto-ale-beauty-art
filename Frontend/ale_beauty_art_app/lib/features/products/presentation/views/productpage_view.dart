import 'package:flutter/material.dart';

class ProductpageView extends StatelessWidget {
  const ProductpageView({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('aqui va un producto'),
      ),
      body: Center(
        child: Text('hola pintalabio'),
      ),
    );
  }
}