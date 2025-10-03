import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

part 'payment_event.dart';

part 'payment_state.dart';

class PaymentBloc extends Bloc<PaymentEvent, PaymentState> {
  final String apiUrl =
      '${dotenv.env['API_BASE_URL']}/api/v1'; // 🔑 cámbialo a tu dominio
  final String token; // JWT para autorización

  PaymentBloc({required this.token}) : super(PaymentInitial()) {
    on<CreatePayment>(_onCreatePayment);
  }

  Future<void> _onCreatePayment(
      CreatePayment event, Emitter<PaymentState> emit) async {
    emit(PaymentLoading());

    try {
      final response = await http.post(
        Uri.parse("$apiUrl/payments/mobile_create"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token", // 🔑 como en BaseController
        },
        body: jsonEncode({
          "transaction_amount": event.transactionAmount,
          "token": event.cardToken,
          "description": event.description,
          "installments": event.installments,
          "payment_method_id": event.paymentMethodId,
          "payer": {
            "email": event.payerEmail,
            "identification": {
              "type": event.identificationType,
              "number": event.identificationNumber
            }
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        emit(PaymentSuccess(
          status: data["status"],
          paymentId: data["id"].toString(),
        ));
      } else {
        final data = jsonDecode(response.body);
        emit(PaymentFailure(
          message: data["detail"] ?? "Error procesando el pago",
        ));
      }
    } catch (e) {
      emit(PaymentFailure(message: e.toString()));
    }
  }
}
