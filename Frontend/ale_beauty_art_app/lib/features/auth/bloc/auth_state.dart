part of 'auth_bloc.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthInProgress extends AuthState {}

class AuthSuccess extends AuthState {
  final Map<String, dynamic> user;
  final String token; // token

  AuthSuccess({
    required this.user,
    required this.token,
  });
}

class AuthFailure extends AuthState {
  final String message;

  AuthFailure(this.message);
}
