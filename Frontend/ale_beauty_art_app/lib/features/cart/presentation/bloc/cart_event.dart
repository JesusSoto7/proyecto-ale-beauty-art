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

// ✅ NUEVO
class UpdateCartToken extends CartEvent {
  final String token;

  UpdateCartToken(this.token);
}

class UpdateCartCredentials extends CartEvent {
  final String token;
  final String client;
  final String uid;

  UpdateCartCredentials({
    required this.token,
    required this.client,
    required this.uid,
  });
}
