import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

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

        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': event.email,
            'password': event.password,
          }),
        );

        if (response.statusCode == 200) {
          final token = response.headers['access-token'];
          final client = response.headers['client'];
          final uid = response.headers['uid'];

          if (token != null && client != null && uid != null) {
            // Guardar tokens en almacenamiento seguro
            await secureStorage.write(key: 'access-token', value: token);
            await secureStorage.write(key: 'client', value: client);
            await secureStorage.write(key: 'uid', value: uid);

            final data = jsonDecode(response.body);
            emit(AuthSuccess(user: data['data']));
          } else {
            emit(AuthFailure('No se recibieron los tokens de autenticación'));
          }
        } else if (response.statusCode == 401) {
          emit(AuthFailure('Correo o contraseña incorrectos'));
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
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth');

        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': event.email,
            'password': event.password,
            'password_confirmation': event.password,
            'nombre': event.name,
            'apellido': event.lastname,
            'telefono': event.phone != 0 ? event.phone : null, //Opcional
          }),
        );

        if (response.statusCode == 200) {
          final token = response.headers['access-token'];
          final client = response.headers['client'];
          final uid = response.headers['uid'];

          if (token != null && client != null && uid != null) {
            // Guardar tokens
            await secureStorage.write(key: 'access-token', value: token);
            await secureStorage.write(key: 'client', value: client);
            await secureStorage.write(key: 'uid', value: uid);

            final data = jsonDecode(response.body);
            emit(AuthSuccess(user: data['data']));
          } else {
            emit(AuthFailure('No se recibieron los tokens de autenticación'));
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
      emit(AuthInProgress());

      // Borra los tokens guardados
      await secureStorage.deleteAll();

      emit(AuthInitial());
    });
  }
}

