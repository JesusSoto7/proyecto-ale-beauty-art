part of 'order_bloc.dart';

@immutable
sealed class OrderState extends Equatable {
  @override
  List<Object?> get props => [];
}

class OrderInitial extends OrderState {}

class OrderLoading extends OrderState {}

class OrderCreated extends OrderState {
  final int orderId;
  OrderCreated(this.orderId);
  @override
  List<Object?> get props => [orderId];
}

class OrdersLoaded extends OrderState {
  final List orders;
  OrdersLoaded(this.orders);
  @override
  List<Object?> get props => [orders];
}

class OrderError extends OrderState {
  final String message;
  OrderError(this.message);
  @override
  List<Object?> get props => [message];
}
