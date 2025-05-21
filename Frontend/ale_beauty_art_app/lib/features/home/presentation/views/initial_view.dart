import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:flutter/material.dart'; //Material app

// import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';  //Importacion de home_bloc
import 'package:flutter_bloc/flutter_bloc.dart'; //Importacion de bloc

class InitialView extends StatelessWidget {
  const InitialView({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter inicio'),
        automaticallyImplyLeading: false, //quita la flechita para regresar
      ),
      body: Center(
        child: Column(
          children: [
            Text('Bienvenido'),
            Text('Cliente'),
            ElevatedButton(
              onPressed: () {
                context.read<HomeBloc>().add(HomeShowProductsPressed());
              },
              child: const Text('Ver Mas Productos'),
            ),
          ],
        ),
      ),
    );
  }
}