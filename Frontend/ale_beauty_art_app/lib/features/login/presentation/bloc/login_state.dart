part of 'login_bloc.dart';

abstract class LoginState {}

class LoginInitial extends LoginState {}

class LoginInProgress extends LoginState {}

class LoginSuccess extends LoginState {
  final String token;
  final String client;
  final String uid;
  final dynamic user;

  LoginSuccess({
    required this.token,
    required this.client,
    required this.uid,
    required this.user,
  });
}

class LoginFailure extends LoginState {
  final String error;

  LoginFailure(this.error);
}
