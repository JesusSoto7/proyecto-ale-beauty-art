import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../auth/bloc/auth_bloc.dart'; // importa tu AuthBloc
import '../bloc/order_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        // Obtiene el token desde AuthBloc
        final authState = context.read<AuthBloc>().state;
        final token = authState is AuthSuccess ? authState.token : "";
        final apiUrl = dotenv.env['API_BASE_URL']! + "/api/v1";

        return OrderBloc(apiUrl: apiUrl, jwtToken: token)..add(FetchOrders());

      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text("Mis Pedidos"),
          centerTitle: true,
          backgroundColor: Colors.pinkAccent,
        ),
        body: BlocBuilder<OrderBloc, OrderState>(
          builder: (context, state) {
            if (state is OrderLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is OrderError) {
              return Center(
                child: Text(
                  state.message,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              );
            }

            if (state is OrdersLoaded) {
              if (state.orders.isEmpty) {
                return const Center(
                  child: Text("No tienes pedidos aún 🛒"),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(10),
                itemCount: state.orders.length,
                itemBuilder: (context, index) {
                  final order = state.orders[index];
                  return ListTile(
                    title: Text("Pedido #${order['id']}"),
                    subtitle: Text("Estado: ${order['status']}"),
                  );
                },
              );
            }

            return const Center(child: Text("Cargando pedidos..."));
          },
        ),
      ),
    );
  }
}
