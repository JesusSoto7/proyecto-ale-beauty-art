import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';

class CustomHttpClient {
  static final FlutterSecureStorage secureStorage =
      const FlutterSecureStorage();
  static final String baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  // Devuelve un cliente HTTP autenticado
  static Future<http.Client> get client async {
    if (kIsWeb) {
      return http.Client();
    } else {
      final token = await secureStorage.read(key: 'jwt_token');
      final ioClient = HttpClient()
        ..badCertificateCallback = (cert, host, port) => true;
      return _AuthenticatedClient(token ?? '', IOClient(ioClient));
    }
  }

  // GET
  static Future<http.Response> getRequest(String path) async {
    final client = await CustomHttpClient.client;
    final response = await client.get(Uri.parse('$baseUrl$path'), headers: {
      'Content-Type': 'application/json',
    });
    return response;
  }

  // POST
  static Future<http.Response> postRequest(
      String path, Map<String, dynamic> body,
      {required Map<String, String> headers}) async {
    final client = await CustomHttpClient.client;
    final token = await FlutterSecureStorage().read(key: 'jwt_token');
    final response = await client.post(
      Uri.parse('$baseUrl/api/v1/orders'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return response;
  }

  // PUT
  static Future<http.Response> putRequest(
      String path, Map<String, dynamic> body) async {
    final client = await CustomHttpClient.client;
    final response = await client.put(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return response;
  }

  // PATCH
  static Future<http.Response> patchRequest(
      String path, Map<String, dynamic> body) async {
    final client = await CustomHttpClient.client;
    final response = await client.patch(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return response;
  }

  // DELETE
  static Future<http.Response> deleteRequest(String path) async {
    final client = await CustomHttpClient.client;
    final response = await client.delete(
      Uri.parse('$baseUrl$path'),
      headers: {'Content-Type': 'application/json'},
    );
    return response;
  }
}

// Cliente autenticado que agrega el token a cada petición
class _AuthenticatedClient extends http.BaseClient {
  final String token;
  final http.Client _inner;

  _AuthenticatedClient(this.token, this._inner);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    if (token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    print('👉 Token enviado en cabecera: Bearer $token');
    print('👉 URL: ${request.url}');
    print('👉 Headers: ${request.headers}');
    return _inner.send(request);
  }
}
