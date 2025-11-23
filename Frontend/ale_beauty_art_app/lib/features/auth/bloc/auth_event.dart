part of 'auth_bloc.dart';

abstract class AuthEvent {}

class LoginSubmitted extends AuthEvent {
  final String email;
  final String password;
  LoginSubmitted(this.email, this.password);
}

class RegisterSubmitted extends AuthEvent {
  final String email;
  final String password;
  final String name;
  final String lastname;
  final String? phone;
  RegisterSubmitted({
    required this.email,
    required this.password,
    required this.name,
    required this.lastname,
    this.phone,
  });
}

class LogoutRequested extends AuthEvent {}

class UpdateProfileSubmitted extends AuthEvent {
  final String nombre;
  final String apellido;
  final String email;
  final String? telefono;
  UpdateProfileSubmitted({required this.nombre, required this.apellido, required this.email, this.telefono});
}

// Nuevos eventos para password
class ForgotPasswordSubmitted extends AuthEvent {
  final String email;
  ForgotPasswordSubmitted(this.email);
}

class ResetPasswordSubmitted extends AuthEvent {
  final String token;
  final String password;
  final String passwordConfirmation;
  ResetPasswordSubmitted({
    required this.token,
    required this.password,
    required this.passwordConfirmation,
  });
}
