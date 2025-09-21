import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      appBar: AppBar(
        title: const Text('Mis direcciones'),
        backgroundColor: AppColors.primaryPink,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: BlocBuilder<ShippingAddressBloc, ShippingAddressState>(
        builder: (context, state) {
          if (state is ShippingAddressLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ShippingAddressLoaded) {
            if (state.addresses.isEmpty) {
              return Center(
                child: Text(
                  'No tienes direcciones.\nAgrega una nueva.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: state.addresses.length,
              itemBuilder: (_, i) {
                final a = state.addresses[i];

                return Card(
                  elevation: 3,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                '${a.nombre} ${a.apellido}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            if (a.predeterminada)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.green[100],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'Predeterminada',
                                  style: TextStyle(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          a.direccion,
                          style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Barrio ID: ${a.neighborhoodId ?? "-"}',
                          style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit, color: Colors.blue),
                              tooltip: 'Editar',
                              onPressed: () {
                                final auth = context.read<AuthBloc>().state as AuthSuccess;
                                context.read<ShippingAddressBloc>().add(UpdateShippingToken(auth.token));

                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ShippingAddressAdd(editAddress: a),
                                  ),
                                );
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              tooltip: 'Eliminar',
                              onPressed: () {
                                context
                                    .read<ShippingAddressBloc>()
                                    .add(DeleteAddress(a.id));
                              },
                            ),
                            IconButton(
                              icon: Icon(
                                Icons.star,
                                color:
                                    a.predeterminada ? Colors.orange : Colors.grey,
                              ),
                              tooltip: 'Establecer como predeterminada',
                              onPressed: () {
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
                'Error: ${state.message}',
                style: const TextStyle(color: Colors.red),
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
     floatingActionButton: FloatingActionButton(
       onPressed: () {
          final auth = context.read<AuthBloc>().state as AuthSuccess;
          context.read<ShippingAddressBloc>().add(UpdateShippingToken(auth.token));

          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ShippingAddressAdd()),
          );
        },
        backgroundColor: AppColors.primaryPink,
        child: const Icon(Icons.add),
      ),
    );
  }
}
