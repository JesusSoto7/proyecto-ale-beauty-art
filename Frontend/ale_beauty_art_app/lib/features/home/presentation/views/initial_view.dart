import 'package:ale_beauty_art_app/styles/colors.dart'; 
import 'package:ale_beauty_art_app/styles/text_styles.dart';//Styless

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';

class InitialView extends StatelessWidget {
  const InitialView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primaryPink,
        automaticallyImplyLeading: false,
        elevation: 0,
        title: Row(
          children: [
            // Logo redondeado
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/images/ale_logo.jpg',
                height: 40,
                width: 40, // para que quede cuadrado
                fit: BoxFit.cover, // para que se ajuste bien
              ),
            ),

            const SizedBox(width: 12), // espacio entre logo y barra

            // Barra de búsqueda
            Expanded(
              child: Container(
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: TextField(
                  //enabled: false, // deshabilitada la escritura
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
              Text('¡Bienvenid@ a Ale Beauty Art!',
              style: AppTextStyles.title.copyWith(fontSize: 24),
              textAlign: TextAlign.center),
              const SizedBox(height: 30), // espacio antes del botón
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentPink,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                onPressed: () {
                  context.read<HomeBloc>().add(HomeShowProductsPressed());
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
    );
  }
}

