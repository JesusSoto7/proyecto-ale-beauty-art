import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_state.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/views/shipping_address_add.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';

class SelectAddressPage extends StatefulWidget {
  final void Function(int addressId) onContinue;
  const SelectAddressPage({super.key, required this.onContinue});

  @override
  State<SelectAddressPage> createState() => _SelectAddressPageState();
}

class _SelectAddressPageState extends State<SelectAddressPage> {
  ShippingAddress? selectedAddress;
  bool isUpdatingDefault = false;

  @override
  void initState() {
    super.initState();
    context.read<ShippingAddressBloc>().add(LoadAddresses());
  }

  void _setDefaultAddress(ShippingAddress addr) async {
    setState(() {
      isUpdatingDefault = true;
      selectedAddress = addr;
    });
    context.read<ShippingAddressBloc>().add(SetDefaultAddress(addr.id));
    // Espera a que el backend actualice y recarga direcciones
    await Future.delayed(const Duration(milliseconds: 400));
    context.read<ShippingAddressBloc>().add(LoadAddresses());
    setState(() {
      isUpdatingDefault = false;
    });
  }

  @override
  Widget build(BuildContext context) {
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
            title: Text(
              'addresses.shipping_title'.tr(),
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
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
          ),
        ),
      ),
      body: BlocBuilder<ShippingAddressBloc, ShippingAddressState>(
        builder: (context, state) {
          if (state is ShippingAddressLoading || isUpdatingDefault) {
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
                  'addresses.select_empty'.tr(),
                  style: AppTextStyles.subtitle,
                  textAlign: TextAlign.center,
                ),
              );
            }

            // Selecciona la predeterminada al iniciar
            selectedAddress ??= addresses.firstWhere(
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
                      final isSelected = addr.id == selectedAddress?.id;

                      return GestureDetector(
                        onTap: () {
                          if (!isSelected) _setDefaultAddress(addr);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: isSelected
                                ? Border.all(color: Color(0xFFD95D85), width: 2)
                                : null,
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? Color(0xFFD95D85).withOpacity(0.22)
                                    : Colors.black.withOpacity(0.08),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: LinearGradient(
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                    colors: isSelected
                                        ? [
                                            Color(0xFFD95D85),
                                            Color(0xFFE58BB1),
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
                                          child: Text(
                                            'addresses.default'.tr(),
                                            style: const TextStyle(
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
                              if (isSelected)
                                const Padding(
                                  padding: EdgeInsets.only(left: 4.0, top: 6.0),
                                  child: Icon(Icons.check_circle,
                                      color: Color(0xFFD95D85), size: 20),
                                ),
                            ],
                          ),
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
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 12,
                        offset: const Offset(0, -3),
                      ),
                    ],
                  ),
                  child: GestureDetector(
                    onTap: () {
                      if (selectedAddress != null) {
                        Navigator.pop(context, selectedAddress!.id);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                              content: Text('addresses.select_required'.tr())),
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
                      child: Center(
                        child: Text(
                          'common.continue'.tr(),
                          style: const TextStyle(
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
