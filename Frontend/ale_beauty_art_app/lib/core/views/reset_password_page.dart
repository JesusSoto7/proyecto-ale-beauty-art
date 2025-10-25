import 'dart:async';

import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uni_links3/uni_links.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({Key? key}) : super(key: key);

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _tokenController = TextEditingController();
  final _passwordController = TextEditingController();
  final _passwordConfirmController = TextEditingController();
  bool _loading = false;
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    // Capturar deep link si la app fue abierta desde uno
    _initUniLinks();
  }

  Future<void> _initUniLinks() async {
    try {
      final initial = await getInitialLink();
      if (initial != null) _handleIncomingLink(initial);

      _sub = linkStream.listen((String? link) {
        if (link != null) _handleIncomingLink(link);
      }, onError: (_) {});
    } catch (e) {
      // ignore
    }
  }

  void _handleIncomingLink(String link) {
    final uri = Uri.parse(link);
    final token = uri.queryParameters['reset_password_token'] ??
        uri.queryParameters['token'];

    if (token != null) {
      setState(() {
        _tokenController.text = token;
      });
    }
    // puedes guardar email si lo necesitas para enviar junto al reset
  }

  @override
  void dispose() {
    _sub?.cancel();
    _tokenController.dispose();
    _passwordController.dispose();
    _passwordConfirmController.dispose();
    super.dispose();
  }

  void _submit() {
    final token = _tokenController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _passwordConfirmController.text.trim();

    if (token.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Falta el token')));
      return;
    }
    if (password.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('La contraseña debe tener al menos 6 caracteres')));
      return;
    }
    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Las contraseñas no coinciden')));
      return;
    }

    context.read<AuthBloc>().add(ResetPasswordSubmitted(
          token: token,
          password: password,
          passwordConfirmation: confirm,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Restablecer contraseña')),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthInProgress)
            setState(() => _loading = true);
          else
            setState(() => _loading = false);

          if (state is PasswordResetSuccess) {
            ScaffoldMessenger.of(context)
                .showSnackBar(SnackBar(content: Text(state.message)));
            Navigator.of(context).pop(); // o navegar al login
          } else if (state is PasswordResetFailure) {
            ScaffoldMessenger.of(context)
                .showSnackBar(SnackBar(content: Text(state.message)));
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                const Text(
                    'Pega el token recibido por correo o abre el enlace desde el correo para autocompletar el token.'),
                const SizedBox(height: 12),
                TextField(
                    controller: _tokenController,
                    decoration: const InputDecoration(hintText: 'Token')),
                const SizedBox(height: 8),
                TextField(
                    controller: _passwordController,
                    decoration:
                        const InputDecoration(hintText: 'Nueva contraseña'),
                    obscureText: true),
                const SizedBox(height: 8),
                TextField(
                    controller: _passwordConfirmController,
                    decoration:
                        const InputDecoration(hintText: 'Confirmar contraseña'),
                    obscureText: true),
                const SizedBox(height: 12),
                ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const CircularProgressIndicator()
                        : const Text('Cambiar contraseña')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
