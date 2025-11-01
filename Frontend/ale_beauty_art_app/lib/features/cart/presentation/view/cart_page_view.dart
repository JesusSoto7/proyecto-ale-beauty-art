import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_state.dart';
import 'package:ale_beauty_art_app/features/checkout/presentation/view/checkout_page.dart';
import 'package:ale_beauty_art_app/features/checkout/shippingAddress/select_address_Page.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CartPageView extends StatefulWidget {
  const CartPageView({super.key});

  @override
  State<CartPageView> createState() => _CartPageViewState();
}

class _CartPageViewState extends State<CartPageView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = context.read<AuthBloc>().state;
      final cartBloc = context.read<CartBloc>();
      if (authState is AuthSuccess) {
        cartBloc.add(UpdateCartToken(authState.token));
      } else {
        cartBloc.add(UpdateCartToken(''));
      }
      cartBloc.add(LoadCart());
    });
  }

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
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            title: Text(
              'cart.title'.tr(),
              style: const TextStyle(
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
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
        ),
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const LoadingView();
          }

          if ((state.token == null || state.token!.isEmpty) &&
              state.products.isEmpty) {
            return Center(
              child: Text(
                'cart.empty'.tr(),
                style: const TextStyle(fontSize: 16, color: Colors.black54),
              ),
            );
          }

          if (state.error != null && state.products.isEmpty) {
            return Center(
              child: Text(
                'cart.empty'.tr(),
                style: const TextStyle(fontSize: 16, color: Colors.black54),
              ),
            );
          }

          if (state.products.isEmpty) {
            return Center(
              child: Text(
                'cart.empty'.tr(),
                style: const TextStyle(fontSize: 16, color: Colors.black54),
              ),
            );
          }

          // 💰 Cálculo de precios con descuentos
          double subtotal = 0;
          double totalDescuentos = 0;

          for (var product in state.products) {
            final cantidad = product['cantidad'] ?? 1;
            final precioOriginal = _parsePrice(product['precio_producto']);
            final precioConDescuento =
                _parsePrice(product['precio_con_descuento']);

            subtotal += precioOriginal * cantidad;
            totalDescuentos += (precioOriginal - precioConDescuento) * cantidad;
          }

          final subtotalConDescuento = subtotal - totalDescuentos;
          const double shippingCost = 10000;
          final total = subtotalConDescuento + shippingCost;
          final token = state.token ?? '';

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
            product['nombre_producto'] ?? 'cart.unnamed_product'.tr();
                    final imageUrl = product['imagen_url'] ?? '';
                    final cantidad = product['cantidad'] ?? 1;

                    // 🔥 CORREGIDO: Usar _parsePrice en lugar de .toDouble()
                    final precioOriginal =
                        _parsePrice(product['precio_producto']);
                    final precioConDescuento =
                        _parsePrice(product['precio_con_descuento']);
                    final tieneDescuento = product['tiene_descuento'] == true ||
                        precioConDescuento < precioOriginal;

                    // Calcular porcentaje de descuento
                    int porcentajeDescuento = 0;
                    if (tieneDescuento && precioOriginal > 0) {
                      porcentajeDescuento =
                          (((precioOriginal - precioConDescuento) /
                                      precioOriginal) *
                                  100)
                              .round();
                    }

                    return Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
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
                              // 🖼️ Imagen del producto
                              Stack(
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
                                              child: const Icon(
                                                  Icons.broken_image,
                                                  color: Colors.grey),
                                            ),
                                          )
                                        : Container(
                                            width: 80,
                                            height: 80,
                                            color: Colors.grey.shade200,
                                            child: const Icon(
                                                Icons.image_outlined,
                                                color: Colors.grey),
                                          ),
                                  ),
                                  // 🏷️ Badge de descuento en la imagen
                                  if (tieneDescuento && porcentajeDescuento > 0)
                                    Positioned(
                                      top: 4,
                                      left: 4,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 3,
                                        ),
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            colors: [
                                              Color(0xFFFF6B9D),
                                              Color(0xFFFF8FB3),
                                            ],
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(0xFFFF6B9D)
                                                  .withOpacity(0.4),
                                              blurRadius: 4,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Text(
                                          '-$porcentajeDescuento%',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 10,
                                          ),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 16),

                              // 📝 Información del producto
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      nombre,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 6),

                                    // 💰 Precios
                                    if (tieneDescuento)
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Precio original tachado
                                          Text(
                                            formatPriceCOP(
                                                precioOriginal.toInt()),
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[500],
                                              decoration:
                                                  TextDecoration.lineThrough,
                                              decorationColor: Colors.grey[400],
                                              decorationThickness: 1.5,
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          // Precio con descuento
                                          Text(
                                            formatPriceCOP(
                                                precioConDescuento.toInt()),
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFFD95D85),
                                            ),
                                          ),
                                        ],
                                      )
                                    else
                                      Text(
                                        formatPriceCOP(precioOriginal.toInt()),
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFFD95D85),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),

                              // 🔢 Contador de cantidad
                              Container(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 6),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: [
                                      Color(0xFFD95D85),
                                      Color(0xFFE58BB1)
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
                                                  productId:
                                                      product['product_id']),
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
                        ),

                        // ❌ Botón eliminar
                        Positioned(
                          top: -6,
                          right: -6,
                          child: GestureDetector(
                            onTap: () async {
                              final confirm =
                                  await _confirmDelete(context, nombre);
                              if (confirm == true) {
                                context.read<CartBloc>().add(
                                      RemoveProductCompletely(
                                        productId: product['product_id'],
                                        quantity: cantidad,
                                      ),
                                    );
                              }
                            },
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFFD95D85),
                                    Color(0xFFE58BB1)
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                border:
                                    Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.15),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  )
                                ],
                              ),
                              child: const Center(
                                child: Icon(Icons.close_rounded,
                                    size: 16, color: Colors.white),
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),

              // 💳 Resumen de compra
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
                    _priceRow('cart.subtotal'.tr(), subtotal),
                    if (totalDescuentos > 0)
                      _priceRow('cart.discounts'.tr(), -totalDescuentos,
                          isDiscount: true),
                    _priceRow('cart.shipping_cost'.tr(), shippingCost),
                    const Divider(height: 20),
                    _priceRow('cart.total'.tr(), total, isBold: true),
                    const SizedBox(height: 18),

                    // 🛒 Botón de compra
                    Container(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFFD95D85),
                            Color.fromARGB(255, 238, 167, 196),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: ElevatedButton(
                        onPressed: () async {
                          final selectedAddressId = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SelectAddressPage(
                                onContinue: (addressId) {
                                  Navigator.pop(context, addressId);
                                },
                              ),
                            ),
                          );
                          if (selectedAddressId != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => CheckoutPage(
                                  cartProducts: state.products,
                                  cartTotal: total,
                                  token: token,
                                  selectedAddressId: selectedAddressId,
                                  restoreCartAfterPayment: false,
                                ),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 18),
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          'cart.complete_purchase'.tr(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
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

  Widget _priceRow(String label, double value,
      {bool isBold = false, bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: isDiscount ? const Color(0xFFD95D85) : Colors.black54,
              fontSize: 14,
              fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          Text(
            formatPriceCOP(value.toInt()),
            style: TextStyle(
              fontSize: 15,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
              color: isDiscount ? const Color(0xFFD95D85) : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Future<bool?> _confirmDelete(BuildContext context, String nombre) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        titlePadding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
        contentPadding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
        actionsPadding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        title: Row(
          children: [
            const Icon(Icons.delete_forever_rounded, color: Color(0xFFD95D85)),
            const SizedBox(width: 8),
            Text('cart.confirm_delete_title'.tr()),
          ],
        ),
        content: Text(
          'cart.confirm_delete_message'.tr(namedArgs: {"name": nombre}),
          style: const TextStyle(color: Colors.black87),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(
              foregroundColor: Colors.black87,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text('common.cancel'.tr()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              backgroundColor: const Color(0xFFD95D85),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
              elevation: 0,
            ),
            child: Text(
              'cart.delete'.tr(),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  /// 🔧 Helper: Parsea de forma segura un precio que puede venir como int, double o String
  double _parsePrice(dynamic value) {
    if (value == null) return 0.0;

    if (value is double) return value;
    if (value is int) return value.toDouble();

    if (value is String) {
      // Intenta parsear el string
      final parsed = double.tryParse(value);
      return parsed ?? 0.0;
    }

    // Si es otro tipo (como num), conviértelo
    try {
      return (value as num).toDouble();
    } catch (e) {
      return 0.0;
    }
  }
}
