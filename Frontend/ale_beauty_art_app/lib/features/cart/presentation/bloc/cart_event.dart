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

// Evento para actualizar el token
class UpdateCartToken extends CartEvent {
  final String token;
  UpdateCartToken(this.token);
}

//Ahora la dirección es opcional
class CreateOrder extends CartEvent {
  final ShippingAddress? selectedAddress;

  CreateOrder({this.selectedAddress});
}
