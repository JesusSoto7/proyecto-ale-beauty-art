import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _submit() {
    // Cierra el teclado
    FocusScope.of(context).unfocus();

    if (!(_formKey.currentState?.validate() ?? false)) return;

    final email = _emailController.text.trim();
    context.read<AuthBloc>().add(ForgotPasswordSubmitted(email));
  }

  void _showInfoDialog(String title, String message, {bool success = false}) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              if (success) {
                Navigator.of(context).pop(); // volver atrás en caso de éxito
              }
            },
            child: Text('common.ok'.tr()),
          ),
        ],
      ),
    );
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return 'forgot_password.email_required'.tr();
    final email = value.trim();
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    if (!emailRegex.hasMatch(email)) return 'forgot_password.email_invalid'.tr();
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          elevation: 0,
          backgroundColor: AppColors.background,
          iconTheme: const IconThemeData(color: AppColors.textPrimary),
          title: Text('forgot_password.title'.tr(),
              style: const TextStyle(color: AppColors.textPrimary)),
          centerTitle: true,
        ),
        body: BlocListener<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state is AuthInProgress) {
              setState(() => _loading = true);
            } else {
              setState(() => _loading = false);
            }

            if (state is PasswordEmailSent) {
              _showInfoDialog('forgot_password.link_sent_title'.tr(), state.message, success: true);
            } else if (state is PasswordResetFailure) {
              _showInfoDialog('forgot_password.error_title'.tr(), state.message, success: false);
            } else if (state is AuthFailure) {
              // Fallback general
              _showInfoDialog('forgot_password.error_title'.tr(), state.message, success: false);
            }
          },
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                children: [
                  // Brief explanation card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.96),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        )
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'forgot_password.title'.tr(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'forgot_password.description'.tr(),
                          style: const TextStyle(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.done,
                          validator: _validateEmail,
                          decoration: InputDecoration(
                            labelText: 'forgot_password.email_label'.tr(),
                            hintText: 'forgot_password.email_hint'.tr(),
                            prefixIcon: const Icon(Icons.alternate_email,
                                color: AppColors.textSecondary),
                            filled: true,
                            fillColor: const Color.fromARGB(255, 255, 255, 255),
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 14, horizontal: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onFieldSubmitted: (_) => _submit(),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              backgroundColor: AppColors.primaryPink,
                              padding: EdgeInsets.zero,
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                        color: Colors.white, strokeWidth: 2))
                                : Text('forgot_password.send_link'.tr(),
                                    style: const TextStyle(fontWeight: FontWeight.w600)),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: _loading
                              ? null
                              : () => Navigator.of(context).pop(),
                          child: Text('forgot_password.back_to_login'.tr()),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  // Help footnote
                  Row(
                    children: [
                      const Icon(Icons.info_outline,
                          size: 18, color: AppColors.textSecondary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'forgot_password.info'.tr(),
                          style: const TextStyle(
                              fontSize: 13, color: AppColors.textSecondary),
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
