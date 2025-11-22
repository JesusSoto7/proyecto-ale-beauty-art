import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/view/favorite_page.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/bloc/order_bloc.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/views/order_page_view.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/views/shipping_address_page.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/views/profile_account_view.dart';
import 'package:flutter/material.dart';
import 'dart:io' show Platform;
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:easy_localization/easy_localization.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Encabezado con gradiente
            Container(
              height: 220,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color.fromRGBO(209, 112, 143, 1),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Botón de selección de idioma en esquina superior derecha
                  SafeArea(
                    child: Align(
                      alignment: Alignment.topRight,
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8, right: 8),
                        child: _LanguageMenuButton(),
                      ),
                    ),
                  ),
                  // Contenido centrado del encabezado
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                  // Avatar con borde blanco y sombra rosadita
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.accentPink.withOpacity(0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 50,
                      backgroundColor: AppColors.primaryPink,
                      child: BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, state) {
                          if (state is AuthSuccess) {
                            final nombre = (state.user['nombre'] ?? '').toString();
                            final email = (state.user['email'] ?? '').toString();
                            final initial = nombre.isNotEmpty
                                ? nombre[0].toUpperCase()
                                : (email.isNotEmpty ? email[0].toUpperCase() : 'J');
                            return Text(
                              initial,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 40,
                                fontWeight: FontWeight.bold,
                              ),
                            );
                          }
                          return const Icon(Icons.person, size: 56, color: Colors.white);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Nombre o invitado
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) {
                      if (state is AuthSuccess) {
                        return Text(
                          '${state.user['nombre'] ?? 'profile.user'.tr()} ${state.user['apellido'] ?? ''}',
                          style: AppTextStyles.title.copyWith(
                            color: Colors.white,
                            fontSize: 22,
                          ),
                        );
                      }
                      return Text(
                        'profile.guest'.tr(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    },
                  ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Botón de acción (Login) - si no está logeado
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: BlocBuilder<AuthBloc, AuthState>(
                builder: (context, state) {
                  if (state is! AuthSuccess) {
                    // Botón login con gradiente
                    return SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginPage()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ).copyWith(
                          backgroundColor: MaterialStateProperty.all(Colors.transparent),
                        ),
                        child: Ink(
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primaryPink, AppColors.accentPink],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Center(
                            child: Text(
                              'profile.login'.tr(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }

                  return const SizedBox.shrink();
                },
              ),
            ),

            const SizedBox(height: 16),

            // Opciones de perfil
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) {
                      if (state is AuthSuccess) {
                        return _buildOptionTile(
                          context,
                          icon: Icons.person,
                          title: 'profile.my_account'.tr(),
                          onTap: () async {
                            final authState = context.read<AuthBloc>().state;
                            if (authState is! AuthSuccess) {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const LoginPage()),
                              );
                              if (result != true) return;
                            }
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const ProfileAccountView()),
                            );
                          },
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                  _buildOptionTile(
                    context,
                    icon: Icons.shopping_bag,
                    title: 'profile.my_orders'.tr(),
                    onTap: () async {
                      final authState = context.read<AuthBloc>().state;
                      if (authState is! AuthSuccess) {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        );
                        if (result != true) return;
                      }
                      final auth = context.read<AuthBloc>().state as AuthSuccess;
                      context.read<OrderBloc>().add(UpdateOrderToken(auth.token));
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const OrderPageView()),
                      );
                    },
                  ),
                  _buildOptionTile(
                    context,
                    icon: Icons.favorite,
                    title: 'profile.favorites'.tr(),
                    onTap: () async {
                      final authState = context.read<AuthBloc>().state;
                      if (authState is! AuthSuccess) {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        );
                        if (result != true) return;
                      }
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const FavoritePage()),
                      );
                    },
                  ),
                  _buildOptionTile(
                    context,
                    icon: Icons.location_on,
                    title: 'profile.my_addresses'.tr(),
                    onTap: () async {
                      final authState = context.read<AuthBloc>().state;
                      if (authState is! AuthSuccess) {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginPage()),
                        );
                        if (result != true) return;
                      }
                      final auth = context.read<AuthBloc>().state as AuthSuccess;
                      context.read<ShippingAddressBloc>().add(UpdateShippingToken(auth.token));
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ShippingAddressPage()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // Widget reutilizable para las opciones
  Widget _buildOptionTile(BuildContext context, {required IconData icon, required String title, required VoidCallback onTap}) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: AppColors.accentPink.withOpacity(0.35),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.accentPink.withOpacity(0.5),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.textSecondary),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.textSecondary),
        onTap: onTap,
      ),
    );
  }
}

class _LanguageMenuButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final currentCode = context.locale.languageCode;
    final isEs = currentCode == 'es';
    return PopupMenuButton<Locale>(
      tooltip: 'common.select_language'.tr(),
      elevation: 8,
      offset: const Offset(0, 10),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      padding: EdgeInsets.zero,
      onSelected: (locale) async {
        await context.setLocale(locale);
        // Reapply system UI style after locale change to avoid OEM/framework
        // resets that can change navigation button colors.
        WidgetsBinding.instance.addPostFrameCallback((_) {
          // small delay to allow framework rebuild to complete on some devices
          Future.delayed(const Duration(milliseconds: 80), () {
            if (Platform.isAndroid) {
              SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
              SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
                systemNavigationBarColor: Color(0xFFE0E0E0),
                systemNavigationBarIconBrightness: Brightness.dark,
                systemNavigationBarDividerColor: Color(0xFFE0E0E0),
                systemNavigationBarContrastEnforced: false,
              ));
            } else {
              SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
                systemNavigationBarColor: Colors.white,
                systemNavigationBarIconBrightness: Brightness.dark,
                systemNavigationBarDividerColor: Colors.white,
              ));
            }
          });
        });
      },
      itemBuilder: (context) => [
        PopupMenuItem<Locale>(
          value: const Locale('es'),
          child: Row(
            children: [
              const Text('🇪🇸'),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'common.spanish'.tr(),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              if (isEs)
                const Icon(Icons.check_circle, size: 18, color: AppColors.primaryPink),
            ],
          ),
        ),
        PopupMenuItem<Locale>(
          value: const Locale('en'),
          child: Row(
            children: [
              const Text('🇺🇸'),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'common.english'.tr(),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              if (!isEs)
                const Icon(Icons.check_circle, size: 18, color: AppColors.primaryPink),
            ],
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white.withOpacity(0.7), width: 1),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFD95D85).withOpacity(0.35),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.language_outlined, color: Colors.white, size: 18),
            const SizedBox(width: 6),
            Text(
              isEs ? 'common.spanish'.tr() : 'common.english'.tr(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
