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
  }

  void _onUpdateCartToken(UpdateCartToken event, Emitter<CartState> emit) {
    _jwtToken = event.token;
  }

  Future<void> _onLoadCart(LoadCart event, Emitter<CartState> emit) async {
    if (_jwtToken == null) {
      emit(state.copyWith(error: 'Token no disponible'));
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
        emit(state.copyWith(
            products: products, isLoading: false, cartId: cartId));
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
}
