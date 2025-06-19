import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';

import 'package:ale_beauty_art_app/styles/colors.dart'; //Styless
import 'package:ale_beauty_art_app/styles/text_styles.dart';//Styless

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class InitialView extends StatelessWidget {
  const InitialView({super.key});

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Si estás en esta vista, retornar false evita cerrar la app accidentalmente
        final canPop = Navigator.of(context).canPop();
        return !canPop; // solo permite salir si no hay nada más en la pila
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.primaryPink,
          automaticallyImplyLeading: false,
          elevation: 0,
          title: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  'assets/images/ale_logo.jpg',
                  height: 40,
                  width: 40,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar...',
                      prefixIcon: Icon(Icons.search, color: AppColors.primaryPink),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '¡Bienvenid@ a Ale Beauty Art!',
                  style: AppTextStyles.title.copyWith(fontSize: 24),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentPink,
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  onPressed: () {
                    context.read<ProductBloc>().add(ProductFetched());
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ProductsPageView()),
                    );
                  },
                  child: const Text(
                    'Ver Productos',
                    style: TextStyle(color: AppColors.buttonText, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}


