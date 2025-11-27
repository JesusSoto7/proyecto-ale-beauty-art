import 'package:equatable/equatable.dart';

class CartState extends Equatable {
  final bool isLoading;
  final List<Map<String, dynamic>> products;
  final String? error;
  final int? orderId;
  final String? token;
  final int? cartId;
  // Server-provided totals (optional)
  final double? subtotalSinIva;
  final double? ivaTotal;
  final double? envio;
  final double? totalConIva;

  const CartState(
      {this.isLoading = false,
      this.products = const [],
      this.error,
      this.orderId,
      this.token,
      this.cartId,
      this.subtotalSinIva,
      this.ivaTotal,
      this.envio,
      this.totalConIva});

  CartState copyWith({
    bool? isLoading,
    List<Map<String, dynamic>>? products,
    String? error,
    int? orderId,
    String? token,
    int? cartId,
    double? subtotalSinIva,
    double? ivaTotal,
    double? envio,
    double? totalConIva,
  }) {
    return CartState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      error: error,
      orderId: orderId ?? this.orderId,
      token: token ?? this.token,
      cartId: cartId ?? this.cartId,
      subtotalSinIva: subtotalSinIva ?? this.subtotalSinIva,
      ivaTotal: ivaTotal ?? this.ivaTotal,
      envio: envio ?? this.envio,
      totalConIva: totalConIva ?? this.totalConIva,
    );
  }

  @override
    List<Object?> get props =>
      [isLoading, products, error, orderId, token, cartId, subtotalSinIva, ivaTotal, envio, totalConIva];
}
