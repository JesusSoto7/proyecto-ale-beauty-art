import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MercadoPagoService {
  final String? publicKey = dotenv.env['MERCADOPAGO_PUBLIC_KEY'];
  final String backendUrl = '${dotenv.env['API_BASE_URL']}/api/v1';

  Future<String?> createCardToken({
    required String cardNumber,
    required int expirationMonth, // ahora int
    required int expirationYear, // ahora int
    required String securityCode,
    required String cardholderName,
    required String identificationType,
    required String identificationNumber,
  }) async {
    final url = Uri.parse(
      "https://api.mercadopago.com/v1/card_tokens?public_key=$publicKey",
    );

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "card_number": cardNumber,
        "expiration_month": expirationMonth,
        "expiration_year": expirationYear,
        "security_code": securityCode,
        "cardholder": {
          "name": cardholderName,
          "identification": {
            "type": identificationType,
            "number": identificationNumber,
          }
        }
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      print("Token generado correctamente: ${data["id"]}");
      return data["id"];
    } else {
      print("Error al crear token: ${response.body}");
      return null;
    }
  }

  Future<Map<String, dynamic>> payWithBackend({
    required String token,
    required double transaction_amount,
    required String paymentMethodId,
    required String email,
    required String docType,
    required String docNumber,
    required int orderId,
  }) async {
    print({
      "token": token,
      "transaction_amount": transaction_amount,
      "paymentMethodId": paymentMethodId,
      "email": email,
      "docType": docType,
      "docNumber": docNumber,
    });

    final url = Uri.parse("$backendUrl/payments/mobile_create");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "transaction_amount": transaction_amount.toInt(),
        "token": token,
        "installments": 1,
        "payment_method_id": paymentMethodId,
        "order_id": orderId,
        "payer": {
          "email": email,
          "identification": {
            "type": docType,
            "number": docNumber,
          }
        }
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {
        "status": "error",
        "detail": response.body,
      };
    }
  }

  Future<Map<String, dynamic>?> getPaymentMethod(String bin) async {
    final url = Uri.parse(
        "https://api.mercadopago.com/v1/payment_methods/search?bin=$bin&public_key=$publicKey");

    final response = await http.get(url);

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      print("👉 Respuesta cruda MP: ${response.body}");

      if (data["results"] != null && data["results"].isNotEmpty) {
        // filtrar SOLO tarjetas de crédito
        final creditCards = data["results"]
            .where((m) =>
                m["payment_type_id"] == "credit_card" &&
                (m["id"] == "visa" ||
                    m["id"] == "master" ||
                    m["id"] == "amex" ||
                    m["id"] == "diners" ||
                    m["id"] == "elo")) // puedes ampliar según soportados
            .toList();

        if (creditCards.isNotEmpty) {
          return creditCards.first;
        }
      }
    } else {
      print("❌ Error al consultar método de pago: ${response.body}");
    }

    return null;
  }
}
