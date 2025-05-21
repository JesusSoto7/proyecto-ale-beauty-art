import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';
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
      ),
      body: Center(
        child: Column(
          children: [
            Text('Bienvenido'),
            Text('Cliente'),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => BlocProvider(
                      create: (_) => ProductBloc()..add(ProductFetched()),
                      child: ProductsPage(),
                    ),
                  ),
                );
              },
              child: Text('Ver productos'),
            ),
          ],
        ),
      ),
    );
  }
}

            // ElevatedButton(
            //   onPressed: () {
            //     context.read<HomeBloc>().add(HomeVerProductosPressed()); //Boton q emite el estado del bloc
            //   },
            //   child: const Text('VerProductos'),
            // ),