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

  String? _token;
  String? _client;
  String? _uid;

  CartBloc() : super(const CartState()) {
    on<LoadCart>(_onLoadCart);
    on<AddProductToCart>(_onAddProduct);
    on<RemoveProductFromCart>(_onRemoveProduct);

    on<UpdateCartCredentials>((event, emit) {
      _token = event.token;
      _client = event.client;
      _uid = event.uid;
    });
  }

  /// 🔐 Obtiene y actualiza los headers
  Future<Map<String, String>?> _getAuthHeaders() async {
    if (_token == null || _client == null || _uid == null) {
      // Si falta algo, intenta leerlo desde storage
      _token ??= await secureStorage.read(key: 'access-token');
      _client ??= await secureStorage.read(key: 'client');
      _uid ??= await secureStorage.read(key: 'uid');
    }

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

  /// 🛒 Cargar carrito
  Future<void> _onLoadCart(LoadCart event, Emitter<CartState> emit) async {
    emit(state.copyWith(isLoading: true, error: null));
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(isLoading: false, error: 'No autenticado'));
        return;
      }

      final response = await http.get(Uri.parse('$apiUrl/cart'), headers: headers);

      if (response.statusCode == 200) {
        // Actualiza headers nuevos si Devise Token Auth los manda
        _updateAuthHeaders(response);

        final data = json.decode(response.body);

        final List<Map<String, dynamic>> products =
            List<Map<String, dynamic>>.from(data['carrito']);

        emit(state.copyWith(
          isLoading: false,
          products: products,
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

  /// ➕ Agregar producto
  Future<void> _onAddProduct(AddProductToCart event, Emitter<CartState> emit) async {
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(error: 'No autenticado'));
        return;
      }

      final response = await http.post(
        Uri.parse('$apiUrl/cart/add_product'),
        headers: headers,
        body: json.encode({
          'product_id': event.productId,
          'cantidad': event.quantity,
        }),
      );

      _updateAuthHeaders(response);

      add(LoadCart());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  /// ❌ Quitar producto
  Future<void> _onRemoveProduct(RemoveProductFromCart event, Emitter<CartState> emit) async {
    try {
      final headers = await _getAuthHeaders();
      if (headers == null) {
        emit(state.copyWith(error: 'No autenticado'));
        return;
      }

      final response = await http.delete(
        Uri.parse('$apiUrl/cart/remove_product'),
        headers: headers,
        body: json.encode({'product_id': event.productId}),
      );

      _updateAuthHeaders(response);

      add(LoadCart());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  /// 🔄 Actualiza tokens si la API los renueva
  void _updateAuthHeaders(http.Response response) async {
    final newToken = response.headers['access-token'];
    final newClient = response.headers['client'];
    final newUid = response.headers['uid'];

    if (newToken != null && newClient != null && newUid != null) {
      await secureStorage.write(key: 'access-token', value: newToken);
      await secureStorage.write(key: 'client', value: newClient);
      await secureStorage.write(key: 'uid', value: newUid);

      _token = newToken;
      _client = newClient;
      _uid = newUid;
    }
  }
}




