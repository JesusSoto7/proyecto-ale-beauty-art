part of 'auth_bloc.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthInProgress extends AuthState {}

class AuthSuccess extends AuthState {
  final Map<String, dynamic> user;

  AuthSuccess({required this.user});
}

class AuthFailure extends AuthState {
  final String message;

  AuthFailure(this.message);
}
