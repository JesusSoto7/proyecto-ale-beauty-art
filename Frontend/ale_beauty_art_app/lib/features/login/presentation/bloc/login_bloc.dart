import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

part 'login_event.dart';
part 'login_state.dart';

class LoginBloc extends Bloc<LoginEvent, LoginState> {
  LoginBloc() : super(LoginInitial()) {
    on<LoginSubmitted>((event, emit) async {
      emit(LoginInProgress());

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
          // ⚠️ IMPORTANTE: Devise Token Auth devuelve los headers en minúsculas
          final token = response.headers['access-token'];
          final client = response.headers['client'];
          final uid = response.headers['uid'];

          if (token != null && client != null && uid != null) {
            final data = jsonDecode(response.body);
            emit(LoginSuccess(
              token: token,
              client: client,
              uid: uid,
              user: data['data'], // aquí viene la info del usuario
            ));
          } else {
            emit(LoginFailure('No se recibieron los tokens de autenticación'));
          }
        } else if (response.statusCode == 401) {
          emit(LoginFailure('Correo o contraseña incorrectos'));
        } else {
          emit(LoginFailure('Error inesperado: ${response.statusCode}'));
        }
      } catch (e) {
        print("❌ Error de login: $e");
        emit(LoginFailure('Error de conexión con el servidor'));
      }
    });
  }
}
