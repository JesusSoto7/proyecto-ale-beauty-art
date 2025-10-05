import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_state.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/bloc/payment_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_page.dart';
import 'package:ale_beauty_art_app/features/checkout/shippingAddress/select_address_Page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class CartPageView extends StatelessWidget {
  const CartPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      resizeToAvoidBottomInset: false,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08), // sombra gris suave
                blurRadius: 12,
                offset: const Offset(0, 3), // ligera hacia abajo
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0, // sin sombra del AppBar, usamos la del Container
            centerTitle: true,
            title: const Text(
              'Mi Carrito',
              style: TextStyle(
                color: Colors.black,
                fontSize: 17,
                fontWeight: FontWeight.w500,
              ),
            ),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Colors.black87,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            systemOverlayStyle:
                SystemUiOverlayStyle.dark, // íconos oscuros en barra de estado
          ),
        ),
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error != null) {
            return Center(
              child: Text(
                state.error!,
                style: AppTextStyles.error,
                textAlign: TextAlign.center,
              ),
            );
          }

          if (state.products.isEmpty) {
            return const Center(
              child: Text(
                'Agrega productos a tu carrito',
                style: TextStyle(fontSize: 16, color: Colors.black54),
              ),
            );
          }

          final subtotal = state.products.fold<double>(
            0,
            (sum, item) =>
                sum + (item['precio_producto'] ?? 0) * (item['cantidad'] ?? 1),
          );
          double shippingCost = 10000;
          final total = subtotal + shippingCost;

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: state.products.length,
                  itemBuilder: (context, index) {
                    final product = state.products[index];
                    final nombre =
                        product['nombre_producto'] ?? 'Producto sin nombre';
                    final imageUrl = product['imagen_url'] ?? '';
                    final cantidad = product['cantidad'] ?? 1;
                    final precio = product['precio_producto'] ?? 0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 18),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: imageUrl.isNotEmpty
                                ? Image.network(
                                    imageUrl,
                                    width: 80,
                                    height: 80,
                                    fit: BoxFit.cover,
                                    errorBuilder:
                                        (context, error, stackTrace) =>
                                            Container(
                                      width: 80,
                                      height: 80,
                                      color: Colors.grey.shade200,
                                      child: const Icon(Icons.broken_image,
                                          color: Colors.grey),
                                    ),
                                  )
                                : Container(
                                    width: 80,
                                    height: 80,
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.image_outlined,
                                        color: Colors.grey),
                                  ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  nombre,
                                  style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '\$${precio.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                      fontSize: 15, color: Colors.black54),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Color(0xFFD95D85), // #d95d85
                                  Color(0xFFE58BB1), // #e58bb1
                                ],
                              ),
                              borderRadius: BorderRadius.circular(30),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.15),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                _iconButton(Icons.remove, () {
                                  if (cantidad > 1) {
                                    context.read<CartBloc>().add(
                                          RemoveProductFromCart(
                                            productId: product['product_id'],
                                          ),
                                        );
                                  }
                                }),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10),
                                  child: Text(
                                    cantidad.toString(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                                _iconButton(Icons.add, () {
                                  context.read<CartBloc>().add(
                                        AddProductToCart(
                                          productId: product['product_id'],
                                          quantity: cantidad + 1,
                                        ),
                                      );
                                }),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: const Offset(0, -3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _priceRow('Subtotal', subtotal),
                    _priceRow('Costo de envío', shippingCost),
                    const Divider(),
                    _priceRow('Total', total, isBold: true),
                    const SizedBox(height: 18),
                    BlocListener<PaymentBloc, PaymentState>(
                      listener: (context, state) {
                        if (state is PaymentSuccess) {
                          final orderId =
                              context.read<CartBloc>().state.orderId;
                          if (orderId != null) {
                            final cartState = context.read<CartBloc>().state;
                            final total = cartState.products.fold<double>(
                              0,
                              (sum, item) =>
                                  sum +
                                  (item['precio_producto'] ?? 0) *
                                      (item['cantidad'] ?? 1),
                            );
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PaymentPage(
                                  orderId: orderId,
                                  amount: total,
                                  token: cartState.token ?? '',
                                ),
                              ),
                            );
                          }
                        } else if (state is PaymentFailure) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(state.message)),
                          );
                        }
                      },
                      child: GestureDetector(
                        onTap: () async {
                          final cartBloc = context.read<CartBloc>();
                          final cartState = cartBloc.state;

                          if (cartState.products.isEmpty) return;

                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const SelectAddressPage()),
                          );

                          if (result != null && result is Map) {
                            final orderId = result['orderId'] as int?;
                            if (orderId != null) {
                              final total = cartState.products.fold<double>(
                                0,
                                (sum, item) =>
                                    sum +
                                    (item['precio_producto'] ?? 0) *
                                        (item['cantidad'] ?? 1),
                              );
                              final token = cartState.token ?? '';
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PaymentPage(
                                    orderId: orderId,
                                    amount: total,
                                    token: token,
                                  ),
                                ),
                              );
                            }
                          }
                        },
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(14),
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Color(0xFFD95D85), // #d95d85
                                Color(0xFFE58BB1), // #e58bb1
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Text(
                              'Completar compra',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 17,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _iconButton(IconData icon, VoidCallback onPressed) {
    return IconButton(
      icon: Icon(icon, color: Colors.white, size: 18),
      onPressed: onPressed,
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
    );
  }

  Widget _priceRow(String label, double value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  color: Colors.black54,
                  fontSize: 14,
                  fontWeight: isBold ? FontWeight.w600 : FontWeight.normal)),
          Text(
            '\$${value.toStringAsFixed(2)}',
            style: TextStyle(
                fontSize: 15,
                fontWeight: isBold ? FontWeight.w700 : FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
