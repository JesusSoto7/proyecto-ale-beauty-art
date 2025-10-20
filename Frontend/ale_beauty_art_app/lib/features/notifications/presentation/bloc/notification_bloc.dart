import 'dart:convert';
import 'package:ale_beauty_art_app/models/userNotification.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

part 'notification_event.dart';
part 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final String apiUrl = '${dotenv.env['API_BASE_URL']}/api/v1';
  String? _jwtToken;

  NotificationBloc() : super(NotificationInitial()) {
    on<UpdateNotificationToken>((event, emit) {
      _jwtToken = event.token;
    });

    on<NotificationFetched>((event, emit) async {
      if (_jwtToken == null || _jwtToken!.isEmpty) {
        emit(NotificationError('Token no disponible'));
        return;
      }

      emit(NotificationLoading());

      try {
        final client = await CustomHttpClient.client;
        final uri = Uri.parse('$apiUrl/notifications');

        final response = await client.get(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
        );

        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          final notifications =
              data.map((json) => UserNotification.fromJson(json)).toList();
          final unreadCount = notifications.where((n) => !n.read).length;

          emit(NotificationLoaded(
            notifications: notifications,
            unreadCount: unreadCount,
          ));
        } else if (response.statusCode == 401) {
          emit(NotificationError('No autorizado'));
        } else {
          emit(NotificationError('Error ${response.statusCode}'));
        }
      } catch (e) {
        emit(NotificationError('Error de red: $e'));
      }
    });

    on<NotificationMarkedAsRead>((event, emit) async {
      if (_jwtToken == null || _jwtToken!.isEmpty) {
        emit(NotificationError('Token no disponible'));
        return;
      }

      try {
        final client = await CustomHttpClient.client;
        final uri = Uri.parse('$apiUrl/notifications/${event.notificationId}');

        final response = await client.put(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
          body: jsonEncode({'read': true}),
        );

        if (response.statusCode == 200) {
          // Recargar notificaciones después de marcar como leída
          add(NotificationFetched());
        } else {
          emit(NotificationError('Error al marcar como leída'));
        }
      } catch (e) {
        emit(NotificationError('Error: $e'));
      }
    });

    on<NotificationRefreshed>((event, emit) async {
      if (_jwtToken == null || _jwtToken!.isEmpty) {
        return;
      }

      try {
        final client = await CustomHttpClient.client;
        final uri = Uri.parse('$apiUrl/notifications');

        final response = await client.get(
          uri,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_jwtToken',
          },
        );

        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          final notifications =
              data.map((json) => UserNotification.fromJson(json)).toList();
          final unreadCount = notifications.where((n) => !n.read).length;

          emit(NotificationLoaded(
            notifications: notifications,
            unreadCount: unreadCount,
          ));
        }
      } catch (e) {
        // Mantener el estado actual en caso de error al refrescar
        if (state is NotificationLoaded) {
          return;
        }
      }
    });
  }
}
