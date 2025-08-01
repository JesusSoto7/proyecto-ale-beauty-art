import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

part 'auth_event.dart';
part 'auth_state.dart';

final secureStorage = FlutterSecureStorage();


class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    // LOGIN
    on<LoginSubmitted>((event, emit) async {
      emit(AuthInProgress());
      try {
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/sign_in');
        final client = await CustomHttpClient.client;
        final response = await client.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': event.email,
            'password': event.password,
          }),
        );

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          
          final token = data['token'];
          final user = data['user'];
          
          if (token != null && user != null) {
            await secureStorage.write(key: 'jwt_token', value: token);

            emit(AuthSuccess(
              user: user,
              token: token,
            ));
          } else {
            emit(AuthFailure('Token o usuario no válidos en la respuesta'));
          }
        } else if (response.statusCode == 401) {
          emit(AuthFailure('Credenciales incorrectas'));
        } else {
          emit(AuthFailure('Error inesperado: ${response.statusCode}'));
        }
      } catch (e) {
        emit(AuthFailure('Error de conexión con el servidor'));
      }
    });

    // REGISTRO
    on<RegisterSubmitted>((event, emit) async {
      emit(AuthInProgress());

      try {
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/sign_up');
        final client = await CustomHttpClient.client;
        final response = await client.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': event.email,
            'password': event.password,
            'password_confirmation': event.password,
            'nombre': event.name,
            'apellido': event.lastname,
            'telefono': event.phone ?? '', // opcional
          }),
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          final data = jsonDecode(response.body);

          final token = data['token'];
          final user = data['user'];

          if (token != null && user != null) {
            await secureStorage.write(key: 'jwt_token', value: token);

            emit(AuthSuccess(
              user: user,
              token: token,
            ));
          } else {
            emit(AuthFailure('Token o usuario no válidos en la respuesta'));
          }
        } else {
          emit(AuthFailure('Error al registrarse: ${response.statusCode}'));
        }
      } catch (e) {
        emit(AuthFailure('Error de conexión con el servidor'));
      }
    });

    // LOGOUT
    on<LogoutRequested>((event, emit) async {
      await secureStorage.delete(key: 'jwt_token');
      emit(AuthInitial());
    });
  }
}


