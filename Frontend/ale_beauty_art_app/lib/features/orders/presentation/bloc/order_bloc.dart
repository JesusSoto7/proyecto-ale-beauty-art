import 'dart:convert';

import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:meta/meta.dart';

part 'order_event.dart';
part 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final String apiUrl = '${dotenv.env['API_BASE_URL']}/api/v1';
  String? _jwtToken;

  OrderBloc() : super(OrderLoading()) {

    on<UpdateOrderToken>((event, emit) {
      _jwtToken = event.token;
    });

    on<FetchOrders>((event, emit) async {
      if (_jwtToken == null || _jwtToken!.isEmpty) {
        emit(OrderError('Token no disponible'));
        return;
      }
      emit(OrderLoading());
      try {
        final client = await CustomHttpClient.client;
        final resp = await client.get(
          Uri.parse('$apiUrl/my_orders'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
        );
        if (resp.statusCode == 200) {
          final body = jsonDecode(resp.body);
          final List orders = body is List ? body : (body['orders'] as List? ?? []);
          emit(OrdersLoaded(orders));
        } else if (resp.statusCode == 401) {
          emit(OrderError('No autorizado'));
        } else {
          emit(OrderError('Error ${resp.statusCode}'));
        }
      } catch (_) {
        emit(OrderError('Error de red'));
      }
    });

    on<CreateOrder>((event, emit) async {
      if (_jwtToken == null || _jwtToken!.isEmpty) {
        emit(OrderError('Token no disponible'));
        return;
      }
      emit(OrderLoading());
      try {
        final response = await CustomHttpClient.postRequest(
          '/api/v1/orders',
          {
            "shipping_address_id": event.shippingAddressId,
            "products": event.products,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
        );
        if (response.statusCode == 201 || response.statusCode == 200) {
          final data = jsonDecode(response.body);
          await Future.delayed(const Duration(seconds: 2));
          emit(OrderCreated(data['order']['id']));
        } else {
          emit(OrderError("Error creando orden: ${response.body}"));
        }
      } catch (e) {
        emit(OrderError("Excepción creando orden: $e"));
      }
    });
  
  }
}
