import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'payment_event.dart';
import 'payment_state.dart'; // tu ruta real

class PaymentBloc extends Bloc<PaymentEvent, PaymentState> {
  PaymentBloc() : super(PaymentInitial()) {
    on<CreateOrderAndPreference>(_onCreatePreference);
  }

  Future<void> _onCreatePreference(
      CreateOrderAndPreference event,
      Emitter<PaymentState> emit) async {
    emit(PaymentLoading());
    try {
      final response = await CustomHttpClient.postRequest(
        '/api/v1/payments/create_preference',
        {'order_id': event.orderId},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final initPoint = data['init_point'] as String?;
        if (initPoint != null && initPoint.isNotEmpty) {
          emit(PaymentPreferenceReady(initPoint));
        } else {
          emit(const PaymentFailure('No se recibió init_point válido.'));
        }
      } else {
        emit(PaymentFailure(
          'Error ${response.statusCode}: ${response.body}',
        ));
      }
    } catch (e) {
      emit(PaymentFailure('Fallo al crear preferencia: $e'));
    }
  }
}
