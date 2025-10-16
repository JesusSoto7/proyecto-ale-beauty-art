part of 'order_detail_cubit.dart';

abstract class OrderDetailState extends Equatable {
  const OrderDetailState();
  @override
  List<Object?> get props => [];
}

class OrderDetailLoading extends OrderDetailState {
  const OrderDetailLoading();
}

class OrderDetailLoaded extends OrderDetailState {
  final Map<String, dynamic> order;
  const OrderDetailLoaded(this.order);
  @override
  List<Object?> get props => [order];
}

class OrderDetailError extends OrderDetailState {
  final String message;
  const OrderDetailError(this.message);
  @override
  List<Object?> get props => [message];
}