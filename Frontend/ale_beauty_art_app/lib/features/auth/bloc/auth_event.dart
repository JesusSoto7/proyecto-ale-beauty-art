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

