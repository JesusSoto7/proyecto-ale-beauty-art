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
      body: SingleChildScrollView( // 🔥 Envuelve todo para evitar overflow
        child: Padding(
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

              // 🔥 Cambia según el estado de autenticación
              BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is AuthSuccess) {
                    return Column(
                      children: [
                        Center(
                          child: Text(
                            '${state.user['nombre'] ?? ''} ${state.user['apellido'] ?? ''}', // ✅ usa los campos correctos
                            style: AppTextStyles.title.copyWith(fontSize: 20),
                          ),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: () {
                            context.read<AuthBloc>().add(LogoutRequested());
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('✅ Sesión cerrada')),
                            );
                          },
                          icon: const Icon(Icons.logout),
                          label: const Text('Cerrar Sesión'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.redAccent,
                          ),
                        ),
                      ],
                    );
                  } else {
                    return Center(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginPage()),
                          );
                        },
                        icon: const Icon(Icons.login),
                        label: const Text('Iniciar Sesión'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryPink,
                        ),
                      ),
                    );
                  }
                },
              ),

              const SizedBox(height: 40),
              const Text('Tus pedidos'),
              const Divider(),
              const Text('Favoritos'),
              const Divider(),
              const Text('Configuración'),
              const Divider(),
            ],
          ),
        ),
      ),
    );
  }
}

