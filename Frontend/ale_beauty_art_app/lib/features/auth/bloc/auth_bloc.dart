import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/features/auth/service/auth_service.dart';
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
        final url =
            Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/sign_in');
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
        final url =
            Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/sign_up');
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

    // dentro del constructor AuthBloc() donde defines on<...> handlers
    // FORGOT PASSWORD
    on<ForgotPasswordSubmitted>((event, emit) async {
      emit(AuthInProgress());
      try {
        final response = await AuthService.forgotPassword(event.email);
        if (response.statusCode == 200) {
          emit(PasswordEmailSent(
              'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.'));
        } else {
          // Intenta parsear un mensaje de error del backend
          final body = jsonDecode(response.body);
          final msg = (body is Map && body['message'] != null)
              ? body['message']
              : 'Error al solicitar el enlace';
          emit(PasswordResetFailure(msg));
        }
      } catch (e) {
        emit(PasswordResetFailure('Error de conexión con el servidor'));
      }
    });

    // RESET PASSWORD
    on<ResetPasswordSubmitted>((event, emit) async {
      emit(AuthInProgress());
      try {
        final response = await AuthService.resetPassword(
          token: event.token,
          password: event.password,
          passwordConfirmation: event.passwordConfirmation,
        );
        if (response.statusCode == 200) {
          emit(PasswordResetSuccess('Contraseña cambiada correctamente'));
        } else {
          final body = jsonDecode(response.body);
          // backend devuelve {status:'error', errors: [...] } o similar
          final errors = body is Map && body['errors'] != null
              ? (body['errors'] as List).join(', ')
              : (body['message'] ?? 'Error al cambiar la contraseña');
          emit(PasswordResetFailure(errors));
        }
      } catch (e) {
        emit(PasswordResetFailure('Error de conexión con el servidor'));
      }
    });

    // LOGOUT
    on<LogoutRequested>((event, emit) async {
      await secureStorage.delete(key: 'jwt_token');
      emit(AuthInitial());
    });

    // UPDATE PROFILE (local state update; backend not available here)
    on<UpdateProfileSubmitted>((event, emit) async {
      final current = state;
      if (current is AuthSuccess) {
        // emit a brief in-progress state if needed
        emit(AuthInProgress());
        // Merge updated fields into user map
        final updatedUser = Map<String, dynamic>.from(current.user);
        updatedUser['nombre'] = event.nombre;
        updatedUser['apellido'] = event.apellido;
        updatedUser['email'] = event.email;
        // optional telefono
        if (event.telefono != null) {
          updatedUser['telefono'] = event.telefono;
        }
        // Persist token remains the same
        await Future.delayed(const Duration(milliseconds: 200));
        emit(AuthSuccess(user: updatedUser, token: current.token));
      }
    });
  }
}
