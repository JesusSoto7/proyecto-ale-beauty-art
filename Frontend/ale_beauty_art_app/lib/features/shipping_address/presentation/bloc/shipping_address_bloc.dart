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

  ShippingAddressBloc() : super(ShippingAddressInitial()) {
    baseUrl = '${dotenv.env['API_BASE_URL']}/api/v1/shipping_addresses';
    on<LoadAddresses>(_onLoadAddresses);
    on<AddAddress>(_onAddAddress);
    on<UpdateAddress>(_onUpdateAddress);
    on<DeleteAddress>(_onDeleteAddress);
    on<SetDefaultAddress>(_onSetDefaultAddress);
  }

  Future<void> _onLoadAddresses(LoadAddresses event, Emitter<ShippingAddressState> emit) async {
    emit(ShippingAddressLoading());
    try {
      final client = await CustomHttpClient.client;
      final res = await client.get(Uri.parse(baseUrl));

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
      final res = await client.post(
        Uri.parse(baseUrl),
        body: jsonEncode({'shipping_address': event.data}),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        add(LoadAddresses());
      } else {
        emit(ShippingAddressError('Error al crear dirección'));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onUpdateAddress(UpdateAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final res = await client.put(
        Uri.parse('$baseUrl/${event.id}'),
        body: jsonEncode({'shipping_address': event.data}),
      );

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        emit(ShippingAddressError('Error al actualizar dirección'));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onDeleteAddress(DeleteAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final res = await client.delete(Uri.parse('$baseUrl/${event.id}'));

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        emit(ShippingAddressError('Error al eliminar dirección'));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }

  Future<void> _onSetDefaultAddress(SetDefaultAddress event, Emitter<ShippingAddressState> emit) async {
    try {
      final client = await CustomHttpClient.client;
      final res = await client.patch(Uri.parse('$baseUrl/${event.id}/set_predeterminada'));

      if (res.statusCode == 200) {
        add(LoadAddresses());
      } else {
        emit(ShippingAddressError('Error al establecer dirección predeterminada'));
      }
    } catch (e) {
      emit(ShippingAddressError(e.toString()));
    }
  }
}
