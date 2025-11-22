import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import '../bloc/shipping_address_bloc.dart';
import '../bloc/shipping_address_event.dart';
import '../bloc/shipping_address_state.dart';
import 'shipping_address_add.dart';

class ShippingAddressPage extends StatelessWidget {
  const ShippingAddressPage({super.key});

  @override
  Widget build(BuildContext context) {
    context.read<ShippingAddressBloc>().add(LoadAddresses());

    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.20),
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
              'addresses.title'.tr(),
              style: const TextStyle(
                color: Colors.black,
                fontSize: 17,
                fontWeight: FontWeight.w600,
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
          if (state is ShippingAddressLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ShippingAddressLoaded) {
            if (state.addresses.isEmpty) {
              return Center(
                child: Text(
                  'addresses.empty'.tr(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              itemCount: state.addresses.length,
              itemBuilder: (_, i) {
                final a = state.addresses[i];

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                '${a.nombre} ${a.apellido}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                ),
                              ),
                            ),
                            if (a.predeterminada)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFFD95D85),
                                      Color(0xFFE58BB1)
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  'addresses.default'.tr(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          a.direccion,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${'addresses.neighborhood'.tr()} ${a.neighborhood?['nombre'] ?? "-"}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            _actionIcon(
                              icon: Icons.edit,
                              tooltip: 'addresses.edit'.tr(),
                              gradient: const LinearGradient(
                                colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
                              ),
                              onTap: () {
                                final auth = context.read<AuthBloc>().state
                                    as AuthSuccess;
                                context
                                    .read<ShippingAddressBloc>()
                                    .add(UpdateShippingToken(auth.token));

                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        ShippingAddressAdd(editAddress: a),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 12),
                            _actionIcon(
                              icon: Icons.delete,
                              tooltip: 'addresses.delete'.tr(),
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFF6B6B), Color(0xFFF44336)],
                              ),
                              onTap: () {
                                context
                                    .read<ShippingAddressBloc>()
                                    .add(DeleteAddress(a.id));
                              },
                            ),
                            const SizedBox(width: 12),
                            _actionIcon(
                              icon: Icons.star_rounded,
                              tooltip: 'addresses.set_default'.tr(),
                              gradient: LinearGradient(
                                colors: a.predeterminada
                                    ? [
                                        const Color(0xFFFFD54F),
                                        const Color(0xFFFFB300)
                                      ]
                                    : [
                                        Colors.grey.shade300,
                                        Colors.grey.shade500
                                      ],
                              ),
                              onTap: () {
                                context
                                    .read<ShippingAddressBloc>()
                                    .add(SetDefaultAddress(a.id));
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          } else if (state is ShippingAddressError) {
            return Center(
              child: Text(
                '${'common.error'.tr()}: ${state.message}',
                style: const TextStyle(color: Colors.red),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.all(Radius.circular(30)),
        ),
        child: FloatingActionButton(
          onPressed: () {
            final auth = context.read<AuthBloc>().state as AuthSuccess;
            context
                .read<ShippingAddressBloc>()
                .add(UpdateShippingToken(auth.token));

            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ShippingAddressAdd()),
            );
          },
          backgroundColor: Colors.transparent,
          elevation: 0,
          highlightElevation: 0,
          splashColor: const Color.fromARGB(0, 0, 0, 0),
          focusColor: const Color.fromARGB(255, 73, 73, 73),
          hoverColor: const Color.fromARGB(173, 216, 60, 146),
          foregroundColor: Colors.transparent,
          shape: const CircleBorder(), // mantiene el círculo perfecto
          child: const Icon(Icons.add, color: Colors.white, size: 26),
        ),
      ),
    );
  }

  /// 🔘 Botón de acción redondo con gradiente
  Widget _actionIcon({
    required IconData icon,
    required LinearGradient gradient,
    required VoidCallback onTap,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: gradient,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: IconButton(
          icon: Icon(icon, size: 18, color: Colors.white),
          onPressed: onTap,
          padding: EdgeInsets.zero,
          splashRadius: 22,
        ),
      ),
    );
  }
}
