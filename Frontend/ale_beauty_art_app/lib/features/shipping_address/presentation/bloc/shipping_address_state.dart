import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'package:equatable/equatable.dart';


abstract class ShippingAddressState extends Equatable {
  const ShippingAddressState();

  @override
  List<Object?> get props => [];
}

class ShippingAddressInitial extends ShippingAddressState {}

class ShippingAddressLoading extends ShippingAddressState {}

class ShippingAddressLoaded extends ShippingAddressState {
  final List<ShippingAddress> addresses;
  const ShippingAddressLoaded(this.addresses);

  @override
  List<Object?> get props => [addresses];
}

class ShippingAddressError extends ShippingAddressState {
  final String message;
  const ShippingAddressError(this.message);

  @override
  List<Object?> get props => [message];
}
