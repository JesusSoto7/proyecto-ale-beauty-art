import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';

class MercadoPagoService {
  final String? publicKey = dotenv.env['MERCADOPAGO_PUBLIC_KEY'];
  final String backendUrl = '${dotenv.env['API_BASE_URL']}/api/v1';

  String getCardBrand(String cardNumber) {
    final clean = cardNumber.replaceAll(' ', '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'master';
    if (clean.startsWith('3')) return 'amex';
    // Puedes mejorar con rangos de BIN si lo necesitas
    return "";
  }

  Future<String?> createCardToken({
    required String cardNumber,
    required int expirationMonth,
    required int expirationYear,
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
    required String jwt,
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

    // Usa el cliente unificado para tolerar certificados en dev y añadir headers coherentes
    final client = await CustomHttpClient.client;
    final response = await client.post(
      url,
      headers: {
        "Content-Type": "application/json",
        "Authorization": 'Bearer $jwt',
      },
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

  Future<Map<String, dynamic>?> getPaymentMethod(String cardNumber) async {
    final bin = cardNumber.replaceAll(' ', '').substring(0, 6);
    final brand = getCardBrand(cardNumber);
    final url = Uri.parse(
        "https://api.mercadopago.com/v1/payment_methods/search?bin=$bin&public_key=$publicKey");

    final response = await http.get(url);

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      print("👉 Respuesta cruda MP: ${response.body}");

      // Marcas que acepta
      const acceptedBrands = [
        "visa",
        "master",
        "mastercard",
        "amex",
        "debvisa", // Visa Débito
        "debmaster" // Mastercard Débito
      ];

      // métodos válidos para ese BIN
      final validMethods = data["results"]
          .where((m) => acceptedBrands.contains(m["id"]))
          .toList();

      print(
          "Métodos de pago válidos encontrados: ${validMethods.map((m) => "${m["id"]} (${m["payment_type_id"]})").join(', ')}");

      // Busca débito para la marca detectada
      final debitMethod = validMethods.firstWhere(
        (m) => m["payment_type_id"] == "debit_card" && m["id"].contains(brand),
        orElse: () => null,
      );
      if (debitMethod != null) {
        print("Método de pago seleccionado (débito): ${debitMethod["id"]}");
        return debitMethod;
      }

      // Busca crédito para la marca detectada
      final creditMethod = validMethods.firstWhere(
        (m) => m["payment_type_id"] == "credit_card" && m["id"].contains(brand),
        orElse: () => null,
      );
      if (creditMethod != null) {
        print("Método de pago seleccionado (crédito): ${creditMethod["id"]}");
        return creditMethod;
      }

      // Si no hay match exacto, usa el primero
      print(
          "⚠️ No se encontró método exacto, usando el primero de los resultados permitidos.");
      if (validMethods.isNotEmpty) return validMethods.first;
    } else {
      print("❌ Error al consultar método de pago: ${response.body}");
    }

    return null;
  }

  Future<void> setOrderPaymentMethod({
    required String jwt,
    required int orderId,
    String? codigo, // p.ej. "mercadopago"
    int? paymentMethodId,
  }) async {
    if (codigo == null && paymentMethodId == null) {
      throw ArgumentError('Debes enviar codigo o paymentMethodId');
    }
    final uri = Uri.parse('$backendUrl/orders/$orderId/set_payment_method');
    final client = await CustomHttpClient.client;
    final res = await client.patch(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwt',
      },
      body: jsonEncode({
        if (codigo != null) 'payment_method_codigo': codigo,
        if (paymentMethodId != null) 'payment_method_id': paymentMethodId,
      }),
    );
    if (res.statusCode != 200) {
      throw Exception(
          'No se pudo asignar método (${res.statusCode}): ${res.body}');
    }
  }
}
