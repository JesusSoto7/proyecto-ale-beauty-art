import 'package:ale_beauty_art_app/styles/colors.dart'; // Importa los colores definidos en tu app
import 'package:flutter/material.dart';

class LoadingView extends StatelessWidget {
  final bool modal;

  const LoadingView({super.key, this.modal = false});

  @override
  Widget build(BuildContext context) {
    if (modal) {
      // Small white card centered so it doesn't change the whole app look
      return Center(
        child: Material(
          color: Colors.white,
          elevation: 8,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 18.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: const [
                LoadingIndicator(size: 28),
                SizedBox(height: 12),
              ],
            ),
          ),
        ),
      );
    }

    // Full screen loading view (keeps white background to match app)
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            LoadingIndicator(),
            SizedBox(height: 16),
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



