part of 'auth_bloc.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthInProgress extends AuthState {}

class AuthSuccess extends AuthState {
  final Map<String, dynamic> user;
  final String token;
  final String client;
  final String uid;

  AuthSuccess({
    required this.user,
    required this.token,
    required this.client,
    required this.uid,
  });
}


class AuthFailure extends AuthState {
  final String message;

  AuthFailure(this.message);
}
