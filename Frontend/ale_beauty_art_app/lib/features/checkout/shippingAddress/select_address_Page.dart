import 'dart:convert';

import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_page.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_state.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/views/shipping_address_add.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';

class SelectAddressPage extends StatelessWidget {
  const SelectAddressPage({super.key});

  @override
  Widget build(BuildContext context) {
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
            return Center(
                child: Text(state.message, style: AppTextStyles.error));
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
                          (context as Element).markNeedsBuild();
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primaryPink.withOpacity(0.1)
                                : Colors.white,
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primaryPink
                                  : Colors.grey.shade300,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${addr.nombre} ${addr.apellido}',
                                  style: (AppTextStyles.body ??
                                          const TextStyle())
                                      .copyWith(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(addr.direccion,
                                  style: AppTextStyles.subtitle),
                              const SizedBox(height: 2),
                              Text(addr.telefono,
                                  style: AppTextStyles.subtitle),
                              if (addr.predeterminada)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text('Predeterminada',
                                      style: AppTextStyles.price.copyWith(
                                          color: AppColors.primaryPink)),
                                ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit,
                                        color: AppColors.primaryPink),
                                    onPressed: () async {
                                      await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => ShippingAddressAdd(
                                              editAddress: addr),
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
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: ElevatedButton(
                    onPressed: () async {
                      final auth =
                          context.read<AuthBloc>().state as AuthSuccess;
                      context.read<CartBloc>().add(UpdateCartToken(auth.token));

                      if (selectedAddress != null) {
                        try {
                          final response = await CustomHttpClient.postRequest(
                            '/api/v1/orders',
                            {
                              "shipping_address_id": selectedAddress!.id,
                            },
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          );

                          if (response.statusCode == 201 ||
                              response.statusCode == 200) {
                            final data = jsonDecode(response.body);
                            final int orderId = data['order']['id'];
                            // Retorna la dirección seleccionada al CartPageView
                            Navigator.pop(context, selectedAddress);
                            // Ahora navega al PaymentPage
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PaymentPage(orderId: orderId),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text(
                                      "Error creando orden: ${response.body}")),
                            );
                          }
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                                content: Text("Excepción creando orden: $e")),
                          );
                        }
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Debes seleccionar una dirección')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryPink,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Continuar',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
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
