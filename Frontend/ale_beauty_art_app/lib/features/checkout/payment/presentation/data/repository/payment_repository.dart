import 'dart:convert';

import 'package:http/http.dart' as http;

/// Repositorio encargado de manejar las llamadas relacionadas con pagos
class PaymentRepository {
  final String baseUrl;

  PaymentRepository({required this.baseUrl});

  /// Crea un nuevo pago enviando los datos al backend
  Future<Map<String, dynamic>> createPayment({
    required String cardNumber,
    required String expirationDate,
    required String cvv,
    required double amount,
  }) async {
    final url = Uri.parse('$baseUrl/api/v1/payments');

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'card_number': cardNumber,
          'expiration_date': expirationDate,
          'cvv': cvv,
          'amount': amount,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al procesar el pago: ${response.statusCode} ${response.body}',
        );
      }
    } catch (e) {
      throw Exception('Excepción en createPayment: $e');
    }
  }

  /// Ejemplo: obtener el estado de un pago
  Future<Map<String, dynamic>> getPaymentStatus(String paymentId) async {
    final url = Uri.parse('$baseUrl/api/v1/payments/$paymentId');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception(
          'Error al consultar estado: ${response.statusCode} ${response.body}',
        );
      }
    } catch (e) {
      throw Exception('Excepción en getPaymentStatus: $e');
    }
  }
}
