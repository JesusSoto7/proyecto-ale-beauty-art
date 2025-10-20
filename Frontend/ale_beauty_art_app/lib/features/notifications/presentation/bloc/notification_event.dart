part of 'notification_bloc.dart';

abstract class NotificationEvent extends Equatable {
  const NotificationEvent();

  @override
  List<Object> get props => [];
}

class UpdateNotificationToken extends NotificationEvent {
  final String token;

  const UpdateNotificationToken(this.token);

  @override
  List<Object> get props => [token];
}

class NotificationFetched extends NotificationEvent {}

class NotificationMarkedAsRead extends NotificationEvent {
  final int notificationId;

  const NotificationMarkedAsRead(this.notificationId);

  @override
  List<Object> get props => [notificationId];
}

class NotificationRefreshed extends NotificationEvent {}
