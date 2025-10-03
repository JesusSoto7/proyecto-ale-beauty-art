part of 'payment_bloc.dart';

@immutable
abstract class PaymentEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class CreatePayment extends PaymentEvent {
  final double transactionAmount;
  final String cardToken;
  final String description;
  final int installments;
  final String paymentMethodId;
  final String payerEmail;
  final String identificationType;
  final String identificationNumber;

  CreatePayment({
    required this.transactionAmount,
    required this.cardToken,
    required this.description,
    required this.installments,
    required this.paymentMethodId,
    required this.payerEmail,
    required this.identificationType,
    required this.identificationNumber,
  });

  @override
  List<Object?> get props => [
        transactionAmount,
        cardToken,
        description,
        installments,
        paymentMethodId,
        payerEmail,
        identificationType,
        identificationNumber,
      ];
}
