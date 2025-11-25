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
            const LoadingIndicator(),
            const SizedBox(height: 16), // Espacio vertical entre el indicador y el texto
          ],
        ),
      ),
    );
  }
}

// Small inline loading indicator that can be used inside buttons or form areas.
class LoadingIndicator extends StatelessWidget {
  final double size;
  final Color? color;

  const LoadingIndicator({Key? key, this.size = 20.0, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.accentPink;
    return SizedBox(
      width: size,
      height: size,
      child: Center(
        child: CircularProgressIndicator(
          strokeWidth: size <= 20 ? 2 : 3,
          color: c,
        ),
      ),
    );
  }
}



