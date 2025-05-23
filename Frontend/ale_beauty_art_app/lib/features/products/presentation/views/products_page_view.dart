import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsPageView extends StatelessWidget {
  const ProductsPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Productos'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          Expanded(
            child: BlocBuilder<ProductBloc, ProductState>(
              builder: (context, state) {
                if (state is ProductLoadInProgress) {
                  return const Center(child: LoadingView());
                } else if (state is ProductLoadSuccess) {
                  return ProductsListView(products: state.products);
                } else if (state is ProductLoadFailure) {
                  return const Center(child: FailureView());
                } else {
                  return const SizedBox.shrink();
                }
              },
            ),
          ),
          const SizedBox(height: 16), // espacio antes del botón
          Center(
            child: ElevatedButton(
              onPressed: () {
                context.read<HomeBloc>().add(HomeVolverPressed());
              },
              child: const Text('Regresar al Inicio'),
            ),
          ),
          const SizedBox(height: 40), // espacio después del botón
        ],
      ),
    );
  }
}