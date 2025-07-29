import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class CustomHttpClient {
  static final FlutterSecureStorage secureStorage = const FlutterSecureStorage();

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
}

class _AuthenticatedClient extends http.BaseClient {
  final String token;
  final http.Client _inner;

  _AuthenticatedClient(this.token, this._inner);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    if (token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    //validar errores
    print('👉 Token enviado en cabecera: Bearer $token');
    print('👉 URL: ${request.url}');
    print('👉 Headers: ${request.headers}');
    return _inner.send(request);
  }
}
