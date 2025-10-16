import 'dart:convert';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';

part 'order_detail_state.dart';

class OrderDetailCubit extends Cubit<OrderDetailState> {
  final String token; // <-- recibe token del AuthBloc
  OrderDetailCubit(this.token) : super(const OrderDetailLoading());

  String get _api => '${dotenv.env['API_BASE_URL']}/api/v1';

  Future<void> fetch(int id) async {
    emit(const OrderDetailLoading());
    try {
      if (token.isEmpty) {
        emit(const OrderDetailError('Token no disponible'));
        return;
      }
      final client = await CustomHttpClient.client;
      final resp = await client.get(
        Uri.parse('$_api/my_orders/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body);
        final Map<String, dynamic> order =
            body is Map<String, dynamic> ? body : (body['order'] as Map<String, dynamic>? ?? {});
        emit(OrderDetailLoaded(order));
      } else if (resp.statusCode == 401) {
        emit(const OrderDetailError('No autorizado'));
      } else {
        emit(OrderDetailError('Error ${resp.statusCode}'));
      }
    } catch (_) {
      emit(const OrderDetailError('Error de red'));
    }
  }
}