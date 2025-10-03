part of 'payment_bloc.dart';

@immutable
sealed class PaymentState extends Equatable {
  @override
  List<Object?> get props => [];
}

class PaymentInitial extends PaymentState {}

class PaymentLoading extends PaymentState {}

class PaymentSuccess extends PaymentState {
  final String status;
  final String paymentId;

  PaymentSuccess({required this.status, required this.paymentId});

  @override
  List<Object?> get props => [status, paymentId];
}

class PaymentFailure extends PaymentState {
  final String message;

  PaymentFailure({required this.message});

  @override
  List<Object?> get props => [message];
}
