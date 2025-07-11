import 'dart:convert';
import 'package:bloc/bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  final String apiUrl = '${dotenv.env['API_BASE_URL']}/api/v1';
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();

  String? _token; // Guarda en memoria
  String? _client;
  String? _uid;

  CartBloc() : super(const CartState()) {
    on<LoadCart>(_onLoadCart);
    on<AddProductToCart>(_onAddProduct);
    on<RemoveProductFromCart>(_onRemoveProduct);
  }

  /// 🔐 Recupera y devuelve headers de autenticación
  Future<Map<String, String>?> _getAuthHeaders() async {
    _token ??= await secureStorage.read(key: 'access-token');
    _client ??= await secureStorage.read(key: 'client');
    _uid ??= await secureStorage.read(key: 'uid');

    if (_token == null || _client == null || _uid == null) {
      return null; // No autenticado
    }

    return {
      'access-token': _token!,
      'client': _client!,
      'uid': _uid!,
      'Content-Type': 'application/json',
    };
  }

  /// 🔄 Actualiza los tokens en memoria y en storage
  Future<void> _updateAuthHeaders(http.Response response) async {
    final newToken = response.headers['access-token'];
    final newClient = response.headers['client'];
    final newUid = response.headers['uid'];

    if (newToken != null && newClient != null && newUid != null) {
      _token = newToken;
      _client = newClient;
      _uid = newUid;

      await secureStorage.write(key: 'access-token', value: newToken);
      await secureStorage.write(key: 'client', value: newClient);
      await secureStorage.write(key: 'uid', value: newUid);
    }
  }

  Future<void> _onLoadCart(LoadCart event, Emitter<CartState> emit) async {
    emit(state.copyWith(isLoading: true, error: null));
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(isLoading: false, error: 'No autenticado'));
        return;
      }

      final response = await http.get(
        Uri.parse('$apiUrl/cart'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        await _updateAuthHeaders(response); // 🔄 Actualiza tokens
        final data = json.decode(response.body);
        emit(state.copyWith(
          isLoading: false,
          products: List<Map<String, dynamic>>.from(data['products']),
        ));
      } else {
        emit(state.copyWith(
          isLoading: false,
          error: 'Error al cargar el carrito: ${response.statusCode}',
        ));
      }
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  Future<void> _onAddProduct(AddProductToCart event, Emitter<CartState> emit) async {
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(error: 'No autenticado'));
        return;
      }

      final response = await http.post(
        Uri.parse('$apiUrl/cart/add'),
        headers: headers,
        body: json.encode({
          'product_id': event.productId,
          'quantity': event.quantity,
        }),
      );

      if (response.statusCode == 200) {
        await _updateAuthHeaders(response); // 🔄 Actualiza tokens
        add(LoadCart()); // Recarga carrito después de agregar
      } else {
        emit(state.copyWith(
          error: 'Error al agregar producto: ${response.statusCode}',
        ));
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onRemoveProduct(RemoveProductFromCart event, Emitter<CartState> emit) async {
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(error: 'No autenticado'));
        return;
      }

      final response = await http.delete(
        Uri.parse('$apiUrl/cart/remove'),
        headers: headers,
        body: json.encode({'product_id': event.productId}),
      );

      if (response.statusCode == 200) {
        await _updateAuthHeaders(response); // 🔄 Actualiza tokens
        add(LoadCart()); // Recarga carrito después de eliminar
      } else {
        emit(state.copyWith(
          error: 'Error al eliminar producto: ${response.statusCode}',
        ));
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }
}


