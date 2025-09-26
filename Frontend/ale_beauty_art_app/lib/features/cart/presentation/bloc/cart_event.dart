import 'package:ale_beauty_art_app/models/ShippingAddress.dart';

abstract class CartEvent {}

class LoadCart extends CartEvent {}

class AddProductToCart extends CartEvent {
  final int productId;
  final int quantity;

  AddProductToCart({required this.productId, this.quantity = 1});
}

class RemoveProductFromCart extends CartEvent {
  final int productId;

  RemoveProductFromCart({required this.productId});
}

class UpdateCartToken extends CartEvent {
  final String token;

  UpdateCartToken(this.token);
}

class CreateOrder extends CartEvent {
  final ShippingAddress selectedAddress; // ← propiedad agregada

  CreateOrder({required this.selectedAddress}); // ← constructor con required
}