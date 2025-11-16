import 'package:ale_beauty_art_app/styles/colors.dart'; // Importa los colores definidos en tu app
import 'package:flutter/material.dart';

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min, // Para que no ocupe toda la pantalla
          children: [
            CircularProgressIndicator(
              color: AppColors.accentPink,
            ),
            const SizedBox(height: 16), // Espacio vertical entre el indicador y el texto
          ],
        ),
      ),
    );
  }
}



