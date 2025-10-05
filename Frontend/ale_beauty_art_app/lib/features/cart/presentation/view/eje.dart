import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_state.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_page.dart';
import 'package:ale_beauty_art_app/features/checkout/shippingAddress/select_address_Page.dart';

class CartPageView extends StatelessWidget {
  const CartPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        title: const Text('Cart', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        leading: BackButton(color: Colors.black),
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.error != null) {
            return Center(
                child: Text(state.error!, style: TextStyle(color: Colors.red)));
          }
          if (state.products.isEmpty) {
            return Center(
                child: Text('Add products to your cart',
                    style: TextStyle(fontSize: 18)));
          }

          double subtotal = state.products.fold<double>(
            0,
            (sum, item) =>
                sum + (item['precio_producto'] ?? 0) * (item['cantidad'] ?? 1),
          );
          double shipping = 10000; // Puedes ajustar esto según tu lógica
          double total = subtotal + shipping;

          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  itemCount: state.products.length,
                  separatorBuilder: (context, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final product = state.products[index];
                    final nombre =
                        product['nombre_producto'] ?? 'Producto sin nombre';
                    final imageUrl = product['imagen_url'] ?? '';
                    final cantidad = product['cantidad'] ?? 1;
                    final precio = product['precio_producto'] ?? 0;

                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListTile(
                        leading: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: imageUrl.isNotEmpty
                              ? Image.network(
                                  imageUrl,
                                  width: 45,
                                  height: 45,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 45,
                                    height: 45,
                                    color: Colors.grey.withOpacity(0.2),
                                    child: const Icon(Icons.broken_image,
                                        color: Colors.redAccent),
                                  ),
                                )
                              : Container(
                                  width: 45,
                                  height: 45,
                                  color: Colors.grey.withOpacity(0.2),
                                  child: const Icon(Icons.image_not_supported,
                                      color: Colors.grey),
                                ),
                        ),
                        title: Text(nombre,
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text('\$${precio.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 14)),
                        trailing: SizedBox(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _CartIconBtn(
                                icon: Icons.remove,
                                onTap: () {
                                  if (cantidad > 1) {
                                    context
                                        .read<CartBloc>()
                                        .add(RemoveProductFromCart(
                                          productId: product['product_id'],
                                        ));
                                  }
                                },
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 8),
                                child: Text('$cantidad',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16)),
                              ),
                              _CartIconBtn(
                                icon: Icons.add,
                                onTap: () {
                                  context.read<CartBloc>().add(AddProductToCart(
                                        productId: product['product_id'],
                                      ));
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              // Summary & Button
              Container(
                width: double.infinity,
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _PriceRow(label: 'Subtotal', value: subtotal),
                    const SizedBox(height: 4),
                    _PriceRow(label: 'Shipping Cost', value: shipping),
                    const Divider(height: 20, thickness: 1.2),
                    _PriceRow(label: 'Total', value: total, isBold: true),
                  ],
                ),
              ),
              SafeArea(
                minimum: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: state.products.isEmpty
                        ? null
                        : () async {
                            final cartBloc = context.read<CartBloc>();
                            final cartState = cartBloc.state;

                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const SelectAddressPage()),
                            );

                            if (result != null && result is Map) {
                              final orderId = result['orderId'] as int?;
                              if (orderId != null) {
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
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF85B81),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30)),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Check Out',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.5),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// Botón rosa circular para + y -
class _CartIconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _CartIconBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Ink(
      decoration: BoxDecoration(
        color: const Color(0xFFF85B81),
        borderRadius: BorderRadius.circular(20),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: SizedBox(
          width: 30,
          height: 30,
          child: Icon(icon, color: Colors.white, size: 20),
        ),
      ),
    );
  }
}

// Fila para mostrar precio con label
class _PriceRow extends StatelessWidget {
  final String label;
  final double value;
  final bool isBold;
  const _PriceRow(
      {required this.label, required this.value, this.isBold = false});

  @override
  Widget build(BuildContext context) {
    final style = isBold
        ? const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)
        : const TextStyle(fontSize: 15);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text('\$${value.toStringAsFixed(2)}', style: style),
      ],
    );
  }
}
