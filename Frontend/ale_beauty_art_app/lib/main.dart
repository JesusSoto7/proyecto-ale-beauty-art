import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home:Scaffold(
        appBar: AppBar(
          title: Text('Mi App'),
        ),
        body: Center(
          child: Text('Hola mundo'),
        ),
      )
    );
  }
}
