import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  void _onRegisterPressed() {
    if (_formKey.currentState!.validate()) {
      final name = _nameController.text.trim();
      final lastname = _lastNameController.text.trim();
      final email = _emailController.text.trim();
      final rawPhone = _phoneController.text.trim();
      final phone = rawPhone.isNotEmpty ? rawPhone : null;
      final password = _passwordController.text.trim();

      context.read<AuthBloc>().add(RegisterSubmitted(
        email: email,
        password: password,
        name: name,
        lastname: lastname,
        phone: phone, 
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primaryPink, AppColors.accentPink],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          tooltip: '',
          onPressed: () => Navigator.pop(context),
        ),
  title: Text('register.title'.tr(), style: const TextStyle(color: Colors.white)),
        centerTitle: true,
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'register.success_login'.tr(),
                style: const TextStyle(
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
            Navigator.pop(context);
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(' ${state.message}')),
            );
          }
        },
        builder: (context, state) {
          if (state is AuthInProgress) {
            return const Center(child: CircularProgressIndicator());
          }
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accentPink.withOpacity(0.35),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    )
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Text(
                        'register.join_header'.tr(),
                        style: AppTextStyles.title.copyWith(
                          color: AppColors.textPrimary,
                          fontSize: 24,
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Nombre
                      TextFormField(
                        controller: _nameController,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.person_outline),
                          hintText: 'register.name'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
            validator: (value) => (value == null || value.isEmpty)
              ? 'register.name'.tr()
                            : null,
                      ),
                      const SizedBox(height: 12),
                      // Apellido
                      TextFormField(
                        controller: _lastNameController,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.person),
                          hintText: 'register.lastname'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
            validator: (value) => (value == null || value.isEmpty)
              ? 'register.lastname'.tr()
                            : null,
                      ),
                      const SizedBox(height: 12),
                      // Correo
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.alternate_email),
                          hintText: 'register.email'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'register.email_required'.tr();
                          } else if (!value.contains('@')) {
                            return 'register.email_invalid'.tr();
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      // Teléfono (opcional)
                      TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.phone_iphone),
                          hintText: 'register.phone_optional'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Contraseña
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.lock_outline_rounded),
                          hintText: 'register.password'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
            validator: (value) => (value == null || value.length < 6)
              ? 'register.password_min'.tr()
                            : null,
                      ),
                      const SizedBox(height: 12),
                      // Confirmar Contraseña
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.lock),
                          hintText: 'register.confirm_password'.tr(),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
            validator: (value) =>
              (value != _passwordController.text)
                ? 'register.password_mismatch'.tr()
                : null,
                      ),
                      const SizedBox(height: 18),
                      // Botón gradiente
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _onRegisterPressed,
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
                                'register.submit'.tr(),
                                style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
