import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/bloc/order_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_page.dart';
import 'package:ale_beauty_art_app/core/utils/app_snack_bar.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';

class CheckoutPage extends StatefulWidget {
  final List cartProducts;
  final double cartTotal;
  final String token;
  final int selectedAddressId;
  final bool restoreCartAfterPayment; // true cuando viene de compra rápida

  const CheckoutPage({
    super.key,
    required this.cartProducts,
    required this.cartTotal,
    required this.token,
    required this.selectedAddressId,
    this.restoreCartAfterPayment = false,
  });

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  bool orderCreatedDispatched = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!orderCreatedDispatched) {
      // Asegura que OrderBloc tenga el token antes de crear la orden
      context.read<OrderBloc>().add(UpdateOrderToken(widget.token));
      context.read<OrderBloc>().add(
            CreateOrder(
              shippingAddressId: widget.selectedAddressId,
              products: widget.cartProducts,
              // token si lo necesitas
            ),
          );
      orderCreatedDispatched = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OrderBloc, OrderState>(
      listener: (context, state) {
        if (state is OrderCreated) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => PaymentPage(
                orderId: state.orderId,
                amount: widget.cartTotal,
                token: widget.token,
                restoreCartAfterPayment: widget.restoreCartAfterPayment,
              ),
            ),
          );
        } else if (state is OrderError) {
          showAppSnackBar(context, state.message);
        }
      },
      builder: (context, state) {
        if (state is OrderLoading) {
          // Fondo blanco con spinner centrado, sin texto
          return const Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: LoadingIndicator(size: 36),
            ),
          );
        }
        // Si no está cargando, muestra nada (o puedes mostrar un placeholder si lo necesitas)
        return const SizedBox.shrink();
      },
    );
  }
}
