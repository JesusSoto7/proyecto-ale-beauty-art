import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final bool isLoading;
  final List<Map<String, dynamic>> products;
  final String? error;
  final int? orderId;

  const CartState({
    this.isLoading = false,
    this.products = const [],
    this.error,
    this.orderId,
  });

  CartState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? products,
    String? error,
    int? orderId, // ✅ Agregar aquí
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      error: error,
      orderId: orderId ?? this.orderId, // ✅ Ahora sí funciona
    );
  }

  @override
  List<Object?> get props => [isLoading, products, error, orderId];
}
