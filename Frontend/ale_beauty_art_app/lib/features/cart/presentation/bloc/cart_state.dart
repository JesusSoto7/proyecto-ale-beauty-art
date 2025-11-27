import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final bool isLoading;
  final List<Map<String, dynamic>> products;
  final String? error;
  final int? orderId;
  final String? token;
  final int? cartId;

  const CartState(
      {this.isLoading = false,
      this.products = const [],
      this.error,
      this.orderId,
      this.token,
      this.cartId});

  CartState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? products,
    String? error,
    int? orderId,
    String? token,
    int? cartId,
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      error: error,
      orderId: orderId ?? this.orderId,
      token: token ?? this.token,
      cartId: cartId ?? this.cartId,
    );
  }

  @override
  List<Object?> get props =>
      [isLoading, products, error, orderId, token, cartId];
}
