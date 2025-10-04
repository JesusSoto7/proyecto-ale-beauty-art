import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final bool isLoading;
  final List<Map<String, dynamic>> products;
  final String? error;
  final int? orderId;
  final String? token;

  const CartState({
    this.isLoading = false,
    this.products = const [],
    this.error,
    this.orderId,
    this.token,
  });

  CartState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? products,
    String? error,
    int? orderId,
    String? token,
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      error: error,
      orderId: orderId ?? this.orderId,
      token: token ?? this.token,
    );
  }

  @override
  List<Object?> get props => [isLoading, products, error, orderId, token];
}
