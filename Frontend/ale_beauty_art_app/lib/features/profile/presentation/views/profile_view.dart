import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                backgroundColor: AppColors.accentPink,
                child: const Icon(Icons.person, size: 50, color: Colors.white),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: Text('Nombre del Usuario',
                  style: AppTextStyles.title.copyWith(fontSize: 20)),
            ),
            const SizedBox(height: 40),
            const Text('Tus pedidos '),
            const Divider(),
            const Text('Favoritos '),
            const Divider(),
            const Text('Configuración '),
            const Divider(),
          ],
        ),
      ),
    );
  }
}
