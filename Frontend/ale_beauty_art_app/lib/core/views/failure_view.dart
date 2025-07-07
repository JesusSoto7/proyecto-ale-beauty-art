import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
  // Ajusta el path

class FailureView extends StatelessWidget {
  const FailureView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline, //icono
              size: 60,
              color: AppColors.accentPink,  // color
            ),
            const SizedBox(height: 16),
            Text(
              '¡Ups! Algo salió mal.',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.accentPink,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Por favor, intenta nuevamente más tarde.',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
