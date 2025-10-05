import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_state.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/views/shipping_address_add.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';

class SelectAddressPage extends StatelessWidget {
  const SelectAddressPage({super.key});

  @override
  Widget build(BuildContext context) {
    context.read<ShippingAddressBloc>().add(LoadAddresses());

    return Scaffold(
      backgroundColor: Colors.white,
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
            title: const Text(
              'Dirección de envío',
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
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
        ),
      ),
      body: BlocBuilder<ShippingAddressBloc, ShippingAddressState>(
        builder: (context, state) {
          if (state is ShippingAddressLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ShippingAddressError) {
            return Center(
              child: Text(state.message, style: AppTextStyles.error),
            );
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
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 20),
                    separatorBuilder: (context, index) =>
                        const SizedBox(height: 14),
                    itemCount: addresses.length,
                    itemBuilder: (context, index) {
                      final addr = addresses[index];
                      final isSelected = addr == selectedAddress;

                      return GestureDetector(
                        onTap: () {
                          selectedAddress = addr;
                          (context as Element).markNeedsBuild();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? const Color.fromARGB(255, 117, 71, 87)
                                        .withOpacity(0.25)
                                    : Colors.black.withOpacity(0.08),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // === ICONO CON GRADIENTE ===
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: isSelected
                                        ? const [
                                            Color(0xFFD95D85),
                                            Color.fromARGB(255, 230, 213, 222),
                                          ]
                                        : [
                                            Colors.grey.shade300,
                                            Colors.grey.shade300,
                                          ],
                                  ),
                                ),
                                child: const Icon(
                                  Icons.location_on,
                                  size: 20,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${addr.nombre} ${addr.apellido}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      addr.direccion,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.black54,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      addr.telefono,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Colors.black45,
                                      ),
                                    ),
                                    if (addr.predeterminada)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 6),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFFEDF3),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: const Text(
                                            'Predeterminada',
                                            style: TextStyle(
                                              color: Color(0xFFAD476B),
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.edit_rounded,
                                  color: Color(0xFFD95D85),
                                ),
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
                        ),
                      );
                    },
                  ),
                ),

                // ======= BOTÓN FINAL CON GRADIENTE =======
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 12,
                        offset: const Offset(0, -3),
                      ),
                    ],
                  ),
                  child: GestureDetector(
                    onTap: () async {
                      final auth =
                          context.read<AuthBloc>().state as AuthSuccess;
                      context.read<CartBloc>().add(UpdateCartToken(auth.token));

                      if (selectedAddress != null) {
                        try {
                          final response = await CustomHttpClient.postRequest(
                            '/api/v1/orders',
                            {"shipping_address_id": selectedAddress!.id},
                            headers: {'Content-Type': 'application/json'},
                          );

                          if (response.statusCode == 201 ||
                              response.statusCode == 200) {
                            final data = jsonDecode(response.body);
                            final int orderId = data['order']['id'];
                            Navigator.pop(context, {
                              'selectedAddress': selectedAddress,
                              'orderId': orderId,
                            });
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                    "Error creando orden: ${response.body}"),
                              ),
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
                            content: Text('Debes seleccionar una dirección'),
                          ),
                        );
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
                            Color(0xFFD95D85),
                            Color(0xFFE58BB1),
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
                          'Continuar',
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
            );
          }
          return const SizedBox();
        },
      ),
    );
  }
}
