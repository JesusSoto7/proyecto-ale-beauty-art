part of 'auth_bloc.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthInProgress extends AuthState {}

class AuthSuccess extends AuthState {
  final Map<String, dynamic> user;
  final String token;
  AuthSuccess({required this.user, required this.token});
}

class AuthFailure extends AuthState {
  final String message;
  AuthFailure(this.message);
}

// Estados para forgot/reset
class PasswordEmailSent extends AuthState {
  final String message;
  PasswordEmailSent(
      [this.message = 'Si el correo existe, recibirás instrucciones.']);
}

class PasswordResetSuccess extends AuthState {
  final String message;
  PasswordResetSuccess([this.message = 'Contraseña actualizada exitosamente.']);
}

class PasswordResetFailure extends AuthState {
  final String message;
  PasswordResetFailure(this.message);
}
