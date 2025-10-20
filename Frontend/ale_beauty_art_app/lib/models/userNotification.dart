import 'package:ale_beauty_art_app/models/NotificationMessage.dart';

class UserNotification {
  final int id;
  final bool read;
  final NotificationMessage notificationMessage;
  final DateTime createdAt;

  UserNotification({
    required this.id,
    required this.read,
    required this.notificationMessage,
    required this.createdAt,
  });

  factory UserNotification.fromJson(Map<String, dynamic> json) {
    return UserNotification(
      id: json['id'],
      read: json['read'] ?? false,
      notificationMessage: NotificationMessage.fromJson(
        json['notification_message'],
      ),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}
