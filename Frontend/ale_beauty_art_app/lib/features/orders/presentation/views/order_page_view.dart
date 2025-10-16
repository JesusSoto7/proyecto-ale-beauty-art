import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/cubit/order_detail_cubit.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/views/order_detail_page_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/bloc/order_bloc.dart';

class OrderPageView extends StatefulWidget {
  const OrderPageView({super.key});

  @override
  State<OrderPageView> createState() => _OrderPageViewState();
}

class _OrderPageViewState extends State<OrderPageView> {
  @override
  void initState() {
    super.initState();
    // Asegura token en el OrderBloc antes de pedir
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthSuccess) {
      context.read<OrderBloc>().add(UpdateOrderToken(authState.token));
    }
    context.read<OrderBloc>().add(FetchOrders());
  }

  Future<void> _refresh() async {
    context.read<OrderBloc>().add(FetchOrders());
  }

  DateTime? _parseDate(dynamic v) {
    if (v == null) return null;
    if (v is int) {
      // epoch en segundos (10 dígitos) o milisegundos
      final isSeconds = v.toString().length == 10;
      final dt = DateTime.fromMillisecondsSinceEpoch(isSeconds ? v * 1000 : v, isUtc: true);
      return dt.toLocal();
    }
    final s = v.toString();
    final dt = DateTime.tryParse(s);
    return dt?.toLocal();
  }

  String _text(dynamic value, {String fallback = '—'}) {
    if (value == null) return fallback;
    final s = value.toString().trim();
    return s.isEmpty ? fallback : s;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
            title: const Text(
              'Mis pedidos',
              style: TextStyle(
                color: Color.fromARGB(255, 0, 0, 0),
                fontSize: 18,
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
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
        ),
      ),
      backgroundColor: const Color(0xFFF8F5F7),
      body: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          if (state is OrderLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is OrderError) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 120),
                children: [
                  Center(child: Text(state.message)),
                  const SizedBox(height: 12),
                  const Center(child: Text('Desliza hacia abajo para reintentar')),
                ],
              ),
            );
          }
          if (state is OrdersLoaded) {
            final List orders = state.orders;
            if (orders.isEmpty) {
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 120),
                  children: const [Center(child: Text('No tienes pedidos todavía'))],
                ),
              );
            }
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: orders.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final o = orders[index] as Map<String, dynamic>;
                  final id = o['id'] ?? o['order_id'];
                  final orderId = (id is int) ? id : int.tryParse(id?.toString() ?? '0') ?? 0;

                  final numeroOrden = o['numero_de_orden'] ?? id?.toString();
                  final status = _text(o['status'] ?? o['estado']).toUpperCase();
                  final fechaRaw = o['fecha_pago'] ?? o['paid_at'] ?? o['created_at'] ?? o['updated_at'];
                  final fechaPago = _parseDate(fechaRaw);

                  final totalRaw = o['pago_total'] ?? o['total'];
                  final double total = totalRaw is num
                      ? (totalRaw).toDouble()
                      : (double.tryParse(totalRaw?.toString() ?? '') ?? 0.0);

                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color.fromARGB(82, 209, 205, 206).withOpacity(0.5),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () async {
                        if (orderId <= 0) return;

                        // Verifica sesión
                        final authState = context.read<AuthBloc>().state;
                        if (authState is! AuthSuccess) {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginPage()),
                          );
                          if (result != true) return;
                        }
                        final auth = context.read<AuthBloc>().state as AuthSuccess;

                        // Navega pasando el token al cubit
                        // No reutilices OrderBloc aquí para no perder el estado de la lista
                        if (!context.mounted) return;
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => BlocProvider(
                              create: (_) => OrderDetailCubit(auth.token)..fetch(orderId),
                              child: OrderDetailPageView(orderId: orderId),
                            ),
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                width: 56,
                                height: 56,
                                color: Colors.pink.shade50,
                                child: const Icon(Icons.receipt_long, color: Color(0xFFD95D85)),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Orden #$numeroOrden',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF2E1A2D),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      const Icon(Icons.calendar_today_outlined, size: 16, color: Colors.black54),
                                      const SizedBox(width: 6),
                                      Text(
                                        fechaPago != null
                                            ? '${fechaPago.day.toString().padLeft(2, '0')}/${fechaPago.month.toString().padLeft(2, '0')}/${fechaPago.year}'
                                            : '—',
                                        style: const TextStyle(color: Colors.black54, fontSize: 13),
                                      ),
                                      const Spacer(),
                                      Text(
                                        formatPriceCOP(total),
                                        style: const TextStyle(
                                          color: Color.fromARGB(255, 102, 61, 82),
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.blueGrey.shade50,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(status, style: const TextStyle(fontSize: 12)),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}