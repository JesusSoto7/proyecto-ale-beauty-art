import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/payments/presentation/bloc/payment_bloc.dart';
import 'package:ale_beauty_art_app/features/payments/presentation/bloc/payment_event.dart';
import 'package:ale_beauty_art_app/features/payments/presentation/bloc/payment_state.dart';
import 'package:ale_beauty_art_app/features/payments/presentation/views/payment_webview_page.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_state.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/views/shipping_address_add.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'dart:async';


class SelectAddressPage extends StatelessWidget {
  const SelectAddressPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Carga inicial de direcciones
    context.read<ShippingAddressBloc>().add(LoadAddresses());

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      appBar: AppBar(
        title: const Text('Seleccionar dirección'),
        backgroundColor: AppColors.primaryPink,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: BlocBuilder<ShippingAddressBloc, ShippingAddressState>(
        builder: (context, state) {
          if (state is ShippingAddressLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ShippingAddressError) {
            return Center(child: Text(state.message, style: AppTextStyles.error));
          } else if (state is ShippingAddressLoaded) {
            final addresses = state.addresses;
            if (addresses.isEmpty) {
              return Center(
                child: Text(
                  'No tienes direcciones guardadas.\nAgrega una para continuar.',
                  style: AppTextStyles.subtitle,
                  textAlign: TextAlign.center,
                ),
              );
            }

            ShippingAddress? selectedAddress = addresses.firstWhere(
              (a) => a.predeterminada,
              orElse: () => addresses[0],
            );

            return Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: addresses.length,
                    itemBuilder: (context, index) {
                      final addr = addresses[index];
                      final isSelected = addr == selectedAddress;

                      return GestureDetector(
                        onTap: () {
                          selectedAddress = addr;
                          (context as Element).markNeedsBuild(); // refresca UI
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primaryPink.withOpacity(0.1)
                                : Colors.white,
                            border: Border.all(
                              color: isSelected ? AppColors.primaryPink : Colors.grey.shade300,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${addr.nombre} ${addr.apellido}',
                                style: (AppTextStyles.body ?? const TextStyle())
                                    .copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(addr.direccion, style: AppTextStyles.subtitle),
                              const SizedBox(height: 2),
                              Text(addr.telefono, style: AppTextStyles.subtitle),
                              if (addr.predeterminada)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    'Predeterminada',
                                    style: (AppTextStyles.price)
                                        .copyWith(color: AppColors.primaryPink),
                                  ),
                                ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: AppColors.primaryPink),
                                    onPressed: () async {
                                      await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) =>
                                              ShippingAddressAdd(editAddress: addr),
                                        ),
                                      );
                                      context
                                          .read<ShippingAddressBloc>()
                                          .add(LoadAddresses());
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                  ElevatedButton(
                    onPressed: () {
                      if (selectedAddress == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Debes seleccionar una dirección')),
                        );
                        return;
                      }

                      final cartBloc = context.read<CartBloc>();
                      final paymentBloc = context.read<PaymentBloc>();

                      // Declarar las suscripciones como nulas inicialmente
                      StreamSubscription? cartSubscription;
                      StreamSubscription? paymentSubscription;

                      // Escuchar PaymentBloc para abrir WebView o mostrar error
                      paymentSubscription = paymentBloc.stream.listen((paymentState) {
                        if (paymentState is PaymentPreferenceReady) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PaymentWebViewPage(url: paymentState.initPoint),
                            ),
                          );
                          cartSubscription?.cancel();
                          paymentSubscription?.cancel();
                        } else if (paymentState is PaymentFailure) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(paymentState.message)),
                          );
                          cartSubscription?.cancel();
                          paymentSubscription?.cancel();
                        }
                      });

                      // Crear la orden y escuchar CartBloc para obtener orderId
                      cartSubscription = cartBloc.stream.listen((cartState) {
                        if (cartState.orderId != null) {
                          paymentBloc.add(CreateOrderAndPreference(cartState.orderId!));
                        }
                      });

                      // 1️⃣ Crear la orden con la dirección seleccionada
                      cartBloc.add(CreateOrder(selectedAddress: selectedAddress!));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryPink,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text(
                      'Continuar',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ),

              ],
            );
          }
          return const SizedBox();
        },
      ),
    );
  }
}
