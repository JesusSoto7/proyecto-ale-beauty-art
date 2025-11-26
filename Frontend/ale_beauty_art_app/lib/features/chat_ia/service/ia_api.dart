import 'dart:convert';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// using IOClient for requests to allow custom HttpClient behavior
import 'package:http/io_client.dart';

Future<String> getAIResponse(String userPrompt, {String? authToken}) async {
  final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/api/ia');
  final token = authToken ?? await FlutterSecureStorage().read(key: 'jwt_token');
  final headers = {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };
  final body = jsonEncode({'prompt': userPrompt});

//Esta solución es temporal/para desarrollo.
//Soluciones correctas y seguras:
//Instalar/usar un certificado firmado por una CA válida Let's Encrypt u otra) en el servidor.
//Añadir el certificado CA al store de confianza del dispositivo/entorno (solo en infra controlada).
//Usar un proxy o túnel TLS con certificado válido (ej. ngrok con TLS, reverse proxy con certs).
//Si usas contenedores/infra local, crear CA local y añadirla como confiable en el emulador/dispositivo.
  final httpClient = HttpClient();
  if (!kReleaseMode) {
    // In non-release builds allow self-signed certs for local/dev servers
    httpClient.badCertificateCallback =
        (X509Certificate cert, String host, int port) => true;
  }
  final ioClient = IOClient(httpClient);
  try {
    final response = await ioClient.post(url, headers: headers, body: body);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['response'] ?? 'Sin respuesta de la IA';
    } else {
      throw Exception('Error al conectar con la IA: ${response.statusCode}');
    }
  } finally {
    ioClient.close();
  }
}
