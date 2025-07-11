import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class CartPageView extends StatelessWidget {
  const CartPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🛒 Tu carrito'),
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
                '❌ ${state.error}',
                style: AppTextStyles.error,
                textAlign: TextAlign.center,
              ),
            );
          }

          if (state.products.isEmpty) {
            return Center(
              child: Text(
                'Tu carrito está vacío 🛍️',
                style: AppTextStyles.subtitle,
                textAlign: TextAlign.center,
              ),
            );
          }

          return ListView.builder(
            itemCount: state.products.length,
            itemBuilder: (context, index) {
              final product = state.products[index];

              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primaryPink.withOpacity(0.2),
                  child: const Icon(Icons.shopping_bag, color: AppColors.primaryPink),
                ),
                title: Text(
                  product['name'] ?? 'Producto sin nombre',
                  style: AppTextStyles.body,
                ),
                subtitle: Text('Cantidad: ${product['quantity'] ?? 1}'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () {
                    // 👉 Elimina producto y recarga carrito
                    context
                        .read<CartBloc>()
                        .add(RemoveProductFromCart(productId: product['id']));
                  },
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ElevatedButton.icon(
          onPressed: () {
            // 👉 Aquí podrías verificar si el usuario está logueado antes de pagar
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ Procediendo al pago...'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryPink,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          icon: const Icon(Icons.payment, color: Colors.white),
          label: const Text(
            'Proceder al Pago',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ),
    );
  }
}
