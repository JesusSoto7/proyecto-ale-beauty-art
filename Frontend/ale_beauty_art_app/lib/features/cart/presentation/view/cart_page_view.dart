import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_state.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/bloc/payment_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_page.dart';
import 'package:ale_beauty_art_app/features/checkout/shippingAddress/select_address_Page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class CartPageView extends StatelessWidget {
  const CartPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text('Tu carrito'),
        backgroundColor: AppColors.primaryPink,
        foregroundColor: Colors.white,
        elevation: 0,
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
            return Center(
              child: Text(
                'Agrega productos a tu carrito',
                style: AppTextStyles.subtitle,
                textAlign: TextAlign.center,
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: state.products.length,
            itemBuilder: (context, index) {
              final product = state.products[index];
              final nombre =
                  product['nombre_producto'] ?? 'Producto sin nombre';
              final imageUrl = product['imagen_url'] ?? '';
              final cantidad = product['cantidad'] ?? 1;
              final precio = product['precio_producto'] ?? 0;

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(12),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: imageUrl.isNotEmpty
                        ? Image.network(
                            imageUrl,
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 60,
                                height: 60,
                                color: AppColors.primaryPink.withOpacity(0.1),
                                child: const Icon(Icons.broken_image,
                                    color: AppColors.primaryPink),
                              );
                            },
                          )
                        : Container(
                            width: 60,
                            height: 60,
                            color: AppColors.primaryPink.withOpacity(0.1),
                            child: const Icon(Icons.image_not_supported,
                                color: AppColors.primaryPink),
                          ),
                  ),
                  title: Text(nombre, style: AppTextStyles.body),
                  subtitle: Text(
                    'Cantidad: $cantidad\n\$${precio * cantidad}',
                    style: AppTextStyles.price,
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () {
                      context.read<CartBloc>().add(RemoveProductFromCart(
                          productId: product['product_id']));
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: SafeArea(
          minimum: const EdgeInsets.all(16),
          child: BlocListener<PaymentBloc, PaymentState>(
            listener: (context, state) {
              if (state is PaymentSuccess) {
                final orderId = context.read<CartBloc>().state.orderId;
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
                        orderId: orderId, // ✅ pasar aquí el orderId
                        amount: total,
                        token: cartState.token ?? '', // ⚡ pasar el token
                      ),
                    ),
                  );
                }
              } else if (state is PaymentFailure) {
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text(state.message)));
              }
            },
            child: ElevatedButton.icon(
              onPressed: () async {
                final cartBloc = context.read<CartBloc>();
                final cartState = cartBloc.state;

                if (cartState.products.isEmpty) return;

                // Abrir selección de dirección y crear orden
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SelectAddressPage()),
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
                    // Obtener el token del CartBloc
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
              icon: const Icon(Icons.payment, color: Colors.white),
              label: const Text('Proceder al Pago',
                  style: TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryPink,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          )),
    );
  }
}
