import 'package:equatable/equatable.dart';

abstract class ShippingAddressEvent extends Equatable {
  const ShippingAddressEvent();

  @override
  List<Object?> get props => [];
}

class LoadAddresses extends ShippingAddressEvent {}

class AddAddress extends ShippingAddressEvent {
  final Map<String, dynamic> data;
  const AddAddress(this.data);

  @override
  List<Object?> get props => [data];
}

class UpdateAddress extends ShippingAddressEvent {
  final int id;
  final Map<String, dynamic> data;
  const UpdateAddress(this.id, this.data);

  @override
  List<Object?> get props => [id, data];
}

class DeleteAddress extends ShippingAddressEvent {
  final int id;
  const DeleteAddress(this.id);

  @override
  List<Object?> get props => [id];
}

class SetDefaultAddress extends ShippingAddressEvent {
  final int id;
  const SetDefaultAddress(this.id);

  @override
  List<Object?> get props => [id];
}

class UpdateShippingToken extends ShippingAddressEvent {
  final String token;
  const UpdateShippingToken(this.token);

  @override
  List<Object?> get props => [token];
}
