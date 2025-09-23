import 'package:equatable/equatable.dart';

abstract class PaymentEvent extends Equatable {
  const PaymentEvent();
  @override
  List<Object?> get props => [];
}

class CreateOrderAndPreference extends PaymentEvent {
  final int orderId;
  const CreateOrderAndPreference(this.orderId);

  @override
  List<Object?> get props => [orderId];
}
