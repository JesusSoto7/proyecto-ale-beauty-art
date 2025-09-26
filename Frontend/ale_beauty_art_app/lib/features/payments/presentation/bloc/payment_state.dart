import 'package:equatable/equatable.dart';

abstract class PaymentState extends Equatable {
  const PaymentState();
  @override
  List<Object?> get props => [];
}

class PaymentInitial extends PaymentState {}
class PaymentLoading extends PaymentState {}
class PaymentPreferenceReady extends PaymentState {
  final String initPoint;
  const PaymentPreferenceReady(this.initPoint);

  @override
  List<Object?> get props => [initPoint];
}
class PaymentFailure extends PaymentState {
  final String message;
  const PaymentFailure(this.message);

  @override
  List<Object?> get props => [message];
}
