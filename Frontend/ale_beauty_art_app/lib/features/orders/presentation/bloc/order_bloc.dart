/* import 'dart:convert';

import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';

part 'order_event.dart';
part 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  OrderBloc() : super(OrderInitial()) {
    on<CreateOrder>(_onCreateOrder);
    on<FetchOrders>(_onFetchOrders);
  }

  Future<void> _onCreateOrder(
      CreateOrder event, Emitter<OrderState> emit) async {
    emit(OrderLoading());
    try {
      final response = await CustomHttpClient.postRequest(
        '/api/v1/orders',
        {
          "shipping_address_id": event.shippingAddressId,
          "products": event.products,
        },
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        emit(OrderCreated(data['order']['id']));
      } else {
        emit(OrderError("Error creando orden: ${response.body}"));
      }
    } catch (e) {
      emit(OrderError("Excepción creando orden: $e"));
    }
  }

  Future<void> _onFetchOrders(
      FetchOrders event, Emitter<OrderState> emit) async {
    emit(OrderLoading());
    try {
      final response = await CustomHttpClient.getRequest(
        '/api/v1/orders',
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> ordersJson = jsonDecode(response.body);
        emit(OrdersLoaded(
            ordersJson)); // Puedes crear un modelo Order si prefieres
      } else {
        emit(OrderError("Error cargando órdenes: ${response.body}"));
      }
    } catch (e) {
      emit(OrderError("Excepción cargando órdenes: $e"));
    }
  }
}
 */
