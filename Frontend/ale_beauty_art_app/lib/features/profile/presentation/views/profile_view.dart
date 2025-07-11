import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 30),
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  // 🌸 Avatar
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primaryPink,
                    child: const Icon(Icons.person, size: 60, color: Colors.white),
                  ),
                  const SizedBox(height: 12),

                  // 🌸 Nombre o invitado
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) {
                      if (state is AuthSuccess) {
                        return Text(
                          '${state.user['nombre'] ?? 'Usuario'} ${state.user['apellido'] ?? ''}',
                          style: AppTextStyles.title.copyWith(
                            color: AppColors.textPrimary,
                            fontSize: 22,
                          ),
                        );
                      } else {
                        return const Text(
                          'Invitado',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      }
                    },
                  ),
                  const SizedBox(height: 6),
                ],
              ),
            ),
            // 🌸 Botón de acción (Login / Logout)
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                if (state is AuthSuccess) {
                  return ElevatedButton.icon(
                    onPressed: () {
                      context.read<AuthBloc>().add(LogoutRequested());
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text(
                            'Sesión cerrada',
                            style: TextStyle(
                              color: Colors.white, // Texto blanco
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          backgroundColor: AppColors.primaryPink, //  Fondo personalizado
                          behavior: SnackBarBehavior.floating, // Flotante
                          margin: const EdgeInsets.fromLTRB(20, 0, 20, 30), // de separación abajo
                          shape: RoundedRectangleBorder( //Bordes redondeados
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 6, // Sombra
                          duration: const Duration(seconds: 3),
                        ),
                      );
                    },
                    icon: const Icon(Icons.logout, color: Colors.white),
                    label: const Text('Cerrar Sesión',
                    style: TextStyle(color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                    ),
                  );
                } else {
                  return ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      );
                    },
                    icon: const Icon(Icons.login, color: Colors.white),
                    label: const Text('Iniciar Sesión',
                    style: TextStyle(color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryPink,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                    ),
                  );
                }
              },
            ),
            const SizedBox(height: 20),

            // 🌸 Opciones de perfil
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildOptionTile(Icons.shopping_bag, 'Mis pedidos', () {
                    // TODO: Navegar a pedidos
                  }),
                  _buildOptionTile(Icons.favorite, 'Favoritos', () {
                    // TODO: Navegar a favoritos
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // 🌸 Widget reutilizable para las opciones
  Widget _buildOptionTile(IconData icon, String title, VoidCallback onTap) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primaryPink),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}

