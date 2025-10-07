part of 'order_bloc.dart';

@immutable
sealed class OrderEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class CreateOrder extends OrderEvent {
  final int shippingAddressId;
  final List products;
  CreateOrder({required this.shippingAddressId, required this.products});
  @override
  List<Object?> get props => [shippingAddressId, products];
}

class FetchOrders extends OrderEvent {}
