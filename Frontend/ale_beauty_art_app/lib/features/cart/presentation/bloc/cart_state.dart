import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final bool isLoading;
  final List<Map<String, dynamic>> products; // Puedes cambiar a un modelo ProductCart
  final String? error;

  const CartState({
    this.isLoading = false,
    this.products = const [],
    this.error,
  });

  CartState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? products,
    String? error,
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      error: error,
    );
  }

  @override
  List<Object?> get props => [isLoading, products, error];
}

