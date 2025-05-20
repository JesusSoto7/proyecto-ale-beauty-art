import 'package:flutter/material.dart';

class InitialView extends StatelessWidget {
  const InitialView({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter inicio'),
      ),
      body: Center(
        child: Text('Hola mundo'),
      ),
    );
  }
}