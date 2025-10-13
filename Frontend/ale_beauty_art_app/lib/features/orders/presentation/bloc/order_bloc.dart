import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:meta/meta.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

part 'order_event.dart';
part 'order_state.dart';

class OrderBloc extends Bloc<OrderEvent, OrderState> {
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  final String apiUrl;
  String? _jwtToken;

  OrderBloc({required this.apiUrl, required String jwtToken})
      : super(OrderInitial()) {
    _jwtToken = jwtToken;
    on<CreateOrder>(_onCreateOrder);
    on<FetchOrders>(_onFetchOrders);
  }

  Future<Map<String, String>> _authHeaders() async {
    final token = _jwtToken ?? await secureStorage.read(key: 'jwt_token');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<void> _onCreateOrder(
      CreateOrder event, Emitter<OrderState> emit) async {
    emit(OrderLoading());
    try {
      final headers = await _authHeaders();
      final response = await CustomHttpClient.postRequest(
        '/api/v1/orders', 
        {
          "shipping_address_id": event.shippingAddressId,
          "products": event.products,
        },
        headers: headers,
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

  Future<void> _onFetchOrders(FetchOrders event, Emitter<OrderState> emit) async {
    emit(OrderLoading());
    try {
      final headers = await _authHeaders();
      print("🟣 URL USADA: $apiUrl/orders");
      print("🪪 TOKEN ENVIADO: ${headers['Authorization']}");

      final response = await CustomHttpClient.getRequest(
        '/api/v1/orders',
        headers: headers,
      );

      print("🔵 STATUS: ${response.statusCode}");
      print("📦 BODY: ${response.body}");

      if (response.statusCode == 200) {
        final List<dynamic> ordersJson = jsonDecode(response.body);
        emit(OrdersLoaded(ordersJson));
      } else {
        emit(OrderError("Error cargando órdenes: ${response.body}"));
      }
    } catch (e) {
      emit(OrderError("Excepción cargando órdenes: $e"));
    }
  }

}
