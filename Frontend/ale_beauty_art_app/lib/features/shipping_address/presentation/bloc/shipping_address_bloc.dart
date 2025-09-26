import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'shipping_address_event.dart';
import 'shipping_address_state.dart';

class ShippingAddressBloc extends Bloc<ShippingAddressEvent, ShippingAddressState> {
  final FlutterSecureStorage secureStorage = const FlutterSecureStorage();
  late final String baseUrl;
  String? _jwtToken;

  ShippingAddressBloc() : super(ShippingAddressInitial()) {
    baseUrl = '${dotenv.env['API_BASE_URL']}/api/v1/shipping_addresses';
    on<UpdateShippingToken>(_onUpdateShippingToken);
    on<LoadAddresses>(_onLoadAddresses);
    on<AddAddress>(_onAddAddress);
    on<UpdateAddress>(_onUpdateAddress);
    on<DeleteAddress>(_onDeleteAddress);
    on<SetDefaultAddress>(_onSetDefaultAddress);
  }

  Future<void> _onUpdateShippingToken(UpdateShippingToken event, Emitter<ShippingAddressState> emit) async {
    _jwtToken = event.token;
    await secureStorage.write(key: 'jwt_token', value: event.token);
  }

  Future<Map<String, String>> _authHeaders() async {
    final token = _jwtToken ?? await secureStorage.read(key: 'jwt_token');
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  Future<void> _onLoadAddresses(LoadAddresses event, Emitter<ShippingAddressState> emit) async {
    emit(ShippingAddressLoading());
    try {
      final client = await CustomHttpClient.client;
      final headers = await _authHeaders();
      final res = await client.get(Uri.parse(baseUrl), headers: headers);

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        final addresses = data.map((e) => ShippingAddress.fromJson(e)).toList();
        emit(ShippingAddressLoaded(addresses));
      } else {
        emit(ShippingAddressError('Error al cargar direcciones'));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onAddAddress(AddAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final headers = await _authHeaders();
      final res = await client.post(
        Uri.parse(baseUrl),
        headers: headers,
        body: jsonEncode({'shipping_address': event.data}),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        add(LoadAddresses());
      } else {
        final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
        final msg = body['errors'] ?? body['message'] ?? 'Error al crear dirección';
        emit(ShippingAddressError(msg.toString()));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onUpdateAddress(UpdateAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final headers = await _authHeaders();
      final res = await client.put(
        Uri.parse('$baseUrl/${event.id}'),
        headers: headers,
        body: jsonEncode({'shipping_address': event.data}),
      );

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
        final msg = body['errors'] ?? body['message'] ?? 'Error al actualizar dirección';
        emit(ShippingAddressError(msg.toString()));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onDeleteAddress(DeleteAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final headers = await _authHeaders();
      final res = await client.delete(Uri.parse('$baseUrl/${event.id}'), headers: headers);

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
        final msg = body['errors'] ?? body['message'] ?? 'Error al eliminar dirección';
        emit(ShippingAddressError(msg.toString()));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onSetDefaultAddress(SetDefaultAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final headers = await _authHeaders();
      final res = await client.patch(Uri.parse('$baseUrl/${event.id}/set_predeterminada'), headers: headers);

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
        final msg = body['errors'] ?? body['message'] ?? 'Error al establecer dirección predeterminada';
        emit(ShippingAddressError(msg.toString()));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }
}
