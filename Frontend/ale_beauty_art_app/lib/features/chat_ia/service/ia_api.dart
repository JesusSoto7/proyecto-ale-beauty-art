import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

Future<String> getAIResponse(String userPrompt, {String? token}) async {
  final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/api/ia');
  final token = await FlutterSecureStorage().read(key: 'jwt_token');
  final headers = {
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };
  final body = jsonEncode({'prompt': userPrompt});

  final response = await http.post(url, headers: headers, body: body);

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['response'] ?? 'Sin respuesta de la IA';
  } else {
    throw Exception('Error al conectar con la IA: ${response.statusCode}');
  }
}
