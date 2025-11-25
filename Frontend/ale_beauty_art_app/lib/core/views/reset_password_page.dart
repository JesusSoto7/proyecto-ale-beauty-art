import 'dart:async';

import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:app_links/app_links.dart';
import 'package:ale_beauty_art_app/core/utils/app_snack_bar.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';

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
  AppLinks? _appLinks;

  @override
  void initState() {
    super.initState();
    // Capturar deep link si la app fue abierta desde uno
    _initUniLinks();
  }

  Future<void> _initUniLinks() async {
    try {
      _appLinks = AppLinks();
  final initialUri = await _appLinks!.getInitialLink();
      if (initialUri != null) {
        _handleIncomingUri(initialUri);
      }

      _sub = _appLinks!.uriLinkStream.listen((Uri uri) {
        _handleIncomingUri(uri);
      }, onError: (_) {});
    } catch (e) {
      // ignore
    }
  }

  void _handleIncomingUri(Uri uri) {
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
    _appLinks = null;
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
      showAppSnackBar(context, 'reset_password.missing_token'.tr());
      return;
    }
    if (password.length < 6) {
      showAppSnackBar(context, 'reset_password.password_min'.tr());
      return;
    }
    if (password != confirm) {
      showAppSnackBar(context, 'reset_password.password_mismatch'.tr());
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
      appBar: AppBar(title: Text('reset_password.title'.tr())),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthInProgress)
            setState(() => _loading = true);
          else
            setState(() => _loading = false);

          if (state is PasswordResetSuccess) {
            showAppSnackBar(context, state.message);
            Navigator.of(context).pop(); // o navegar al login
          } else if (state is PasswordResetFailure) {
            showAppSnackBar(context, state.message);
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
        Text('reset_password.paste_token_hint'.tr()),
                const SizedBox(height: 12),
        TextField(
          controller: _tokenController,
          decoration: InputDecoration(hintText: 'reset_password.token'.tr())),
                const SizedBox(height: 8),
        TextField(
          controller: _passwordController,
          decoration:
            InputDecoration(hintText: 'reset_password.new_password'.tr()),
          obscureText: true),
                const SizedBox(height: 8),
        TextField(
          controller: _passwordConfirmController,
          decoration:
            InputDecoration(hintText: 'reset_password.confirm_password'.tr()),
          obscureText: true),
                const SizedBox(height: 12),
        ElevatedButton(
          onPressed: _loading ? null : _submit,
          child: _loading
            ? const LoadingIndicator(size: 18, color: Colors.white)
            : Text('reset_password.change_password'.tr())),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
