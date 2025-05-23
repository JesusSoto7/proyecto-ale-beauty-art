import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
import 'package:ale_beauty_art_app/styles/colors.dart'; // Estilos

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsPageView extends StatelessWidget {
  const ProductsPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Contenido de productos gestianado por bloc
          Expanded(
            child: BlocBuilder<ProductBloc, ProductState>(
              builder: (context, state) {
                if (state is ProductLoadInProgress) {
                  return const LoadingView(); 
                } else if (state is ProductLoadSuccess) {
                  return ProductsListView(products: state.products);
                } else if (state is ProductLoadFailure) {
                  return const FailureView(); 
                } else {
                  return const SizedBox.shrink(); // Widget basio por defecto para evitar tantos errores
                }
              },
            ),
          ),

          const SizedBox(height: 16), // Espacio antes del botón

          // Botón para regresar al inicio
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentPink,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              onPressed: () {
                context.read<HomeBloc>().add(HomeVolverPressed());
              },
              child: const Text(
                'Regresar al Inicio',
                style: TextStyle(
                  color: AppColors.buttonText,
                  fontSize: 16,
                ),
              ),
            ),
          ),

          const SizedBox(height: 40), // Espacio debajo del botón
        ],
      ),
    );
  }
}
