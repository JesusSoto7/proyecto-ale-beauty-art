import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';

class AuthService {
  static Future<http.Response> forgotPassword(String email) async {
    final url =
        Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/password/forgot');
    final client = await CustomHttpClient.client;
    return client.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
  }

  static Future<http.Response> resetPassword({
    required String token,
    required String password,
    required String passwordConfirmation,
    String? email,
  }) async {
    final url =
        Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/auth/password/reset');
    final client = await CustomHttpClient.client;
    final body = {
      'reset_password_token': token,
      'password': password,
      'password_confirmation': passwordConfirmation,
    };
    if (email != null) body['email'] = email;
    return client.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
  }
}
