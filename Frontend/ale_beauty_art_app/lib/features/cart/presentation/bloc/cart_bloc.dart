import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final String apiUrl = '${dotenv.env['API_BASE_URL']}/api/v1';
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  String? _jwtToken;

  CartBloc() : super(const CartState()) {
    on<UpdateCartToken>(_onUpdateCartToken);
    on<LoadCart>(_onLoadCart);
    on<AddProductToCart>(_onAddProductToCart);
    on<RemoveProductFromCart>(_onRemoveProductFromCart);
    on<RemoveProductCompletely>(_onRemoveProductCompletely);
  }

  void _onUpdateCartToken(UpdateCartToken event, Emitter<CartState> emit) {
    // Permitir limpiar el token pasando cadena vacía
    _jwtToken = (event.token.isEmpty) ? null : event.token;
    emit(state.copyWith(token: _jwtToken));
  }

  Future<void> _onLoadCart(LoadCart event, Emitter<CartState> emit) async {
    // Si no hay token, mostramos carrito vacío en lugar de error
    if (_jwtToken == null || _jwtToken!.isEmpty) {
      emit(state.copyWith(isLoading: false, error: null, products: const []));
      return;
    }
    emit(state.copyWith(isLoading: true, error: null));
    try {
      final client = await CustomHttpClient.client;
      final response = await client.get(
        Uri.parse('$apiUrl/cart'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> json = jsonDecode(response.body);
        final int cartId = json['id'];
        final List<Map<String, dynamic>> products = (json['products'] as List)
            .map((item) => item as Map<String, dynamic>)
            .toList();
        // Parse optional server-provided totals (nombres: subtotal_sin_iva, iva_total, envio, total_con_iva)
        double? subtotalSinIva;
        double? ivaTotal;
        double? envio;
        double? totalConIva;

        try {
          if (json.containsKey('subtotal_sin_iva')) {
            subtotalSinIva = (json['subtotal_sin_iva'] is num)
                ? (json['subtotal_sin_iva'] as num).toDouble()
                : double.tryParse(json['subtotal_sin_iva'].toString());
          }
          if (json.containsKey('iva_total')) {
            ivaTotal = (json['iva_total'] is num)
                ? (json['iva_total'] as num).toDouble()
                : double.tryParse(json['iva_total'].toString());
          }
          if (json.containsKey('envio')) {
            envio = (json['envio'] is num)
                ? (json['envio'] as num).toDouble()
                : double.tryParse(json['envio'].toString());
          }
          if (json.containsKey('total_con_iva')) {
            totalConIva = (json['total_con_iva'] is num)
                ? (json['total_con_iva'] as num).toDouble()
                : double.tryParse(json['total_con_iva'].toString());
          }
        } catch (_) {
          // ignore parse errors and leave nulls
        }

        emit(state.copyWith(
            products: products,
            isLoading: false,
            cartId: cartId,
            subtotalSinIva: subtotalSinIva,
            ivaTotal: ivaTotal,
            envio: envio,
            totalConIva: totalConIva));
      } else {
        emit(
            state.copyWith(error: 'Error al cargar carrito', isLoading: false));
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString(), isLoading: false));
    }
  }

  Future<void> _onAddProductToCart(
      AddProductToCart event, Emitter<CartState> emit) async {
    if (_jwtToken == null) return;
    try {
      final client = await CustomHttpClient.client;
      final response = await client.post(
        Uri.parse('$apiUrl/cart/add_product'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
        body: jsonEncode({'product_id': event.productId}),
      );
      if (response.statusCode == 200) {
        add(LoadCart());
      } else {
        emit(state.copyWith(error: 'No se pudo agregar el producto'));
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onRemoveProductFromCart(
      RemoveProductFromCart event, Emitter<CartState> emit) async {
    if (_jwtToken == null) return;
    try {
      final client = await CustomHttpClient.client;
      final response = await client.delete(
        Uri.parse('$apiUrl/cart/remove_product'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
        body: jsonEncode({'product_id': event.productId}),
      );
      if (response.statusCode == 200) {
        add(LoadCart());
      } else {
        emit(state.copyWith(error: 'No se pudo eliminar el producto'));
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onRemoveProductCompletely(
      RemoveProductCompletely event, Emitter<CartState> emit) async {
    if (_jwtToken == null) return;
    try {
      final client = await CustomHttpClient.client;
      // Si el backend no expone endpoint específico, repetimos la operación según cantidad
      for (int i = 0; i < (event.quantity <= 0 ? 1 : event.quantity); i++) {
        final response = await client.delete(
          Uri.parse('$apiUrl/cart/remove_product'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
          body: jsonEncode({'product_id': event.productId}),
        );
        if (response.statusCode != 200) {
          emit(state.copyWith(error: 'No se pudo eliminar el producto'));
          break;
        }
      }
      add(LoadCart());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }
}
