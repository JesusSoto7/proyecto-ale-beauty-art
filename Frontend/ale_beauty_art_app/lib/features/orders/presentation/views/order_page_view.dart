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
      final isSeconds = v.toString().length == 10;
      final dt = DateTime.fromMillisecondsSinceEpoch(isSeconds ? v * 1000 : v,
          isUtc: true);
      return dt.toLocal();
    }
    final s = v.toString();
    final dt = DateTime.tryParse(s);
    return dt?.toLocal();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pagado':
      case 'paid':
      case 'completado':
      case 'pagada':
        return const Color(0xFF4CAF50);
      case 'pendiente':
      case 'pending':
        return const Color(0xFFFF9800);
      case 'cancelado':
      case 'cancelled':
        return const Color(0xFFE53935);
      case 'enviado':
      case 'shipped':
        return const Color(0xFF2196F3);
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'pagado':
      case 'paid':
      case 'completado':
      case 'pagada':
        return Icons.check_circle_rounded;
      case 'pendiente':
      case 'pending':
        return Icons.schedule_rounded;
      case 'cancelado':
      case 'cancelled':
        return Icons.cancel_rounded;
      case 'enviado':
      case 'shipped':
        return Icons.local_shipping_rounded;
      default:
        return Icons.info_rounded;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pagado':
      case 'paid':
      case 'pagada':
        return 'Pagado';
      case 'completado':
        return 'Completado';
      case 'pendiente':
      case 'pending':
        return 'Pendiente';
      case 'cancelado':
      case 'cancelled':
        return 'Cancelado';
      case 'enviado':
      case 'shipped':
        return 'Enviado';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
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
            systemOverlayStyle: SystemUiOverlayStyle.dark,
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Color(0xFFD95D85),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              'Mis Pedidos',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
      body: BlocBuilder<OrderBloc, OrderState>(
        builder: (context, state) {
          if (state is OrderLoading) {
            return const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFD95D85),
              ),
            );
          }

          if (state is OrderError) {
            return RefreshIndicator(
              color: const Color(0xFFD95D85),
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 120),
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      state.message,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      'Desliza para reintentar',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          if (state is OrdersLoaded) {
            final List orders = state.orders;

            if (orders.isEmpty) {
              return RefreshIndicator(
                color: const Color(0xFFD95D85),
                onRefresh: _refresh,
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 120),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFEEF3),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.shopping_bag_outlined,
                        size: 64,
                        color: Color(0xFFD95D85),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Center(
                      child: Text(
                        'No tienes pedidos',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        '¡Empieza a comprar ahora!',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              color: const Color(0xFFD95D85),
              onRefresh: _refresh,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: orders.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final o = orders[index] as Map<String, dynamic>;
                  final id = o['id'] ?? o['order_id'];
                  final orderId = (id is int)
                      ? id
                      : int.tryParse(id?.toString() ?? '0') ?? 0;

                  final numeroOrden = o['numero_de_orden'] ?? id?.toString();
                  final status = o['status']?.toString() ?? 'pendiente';
                  final fechaRaw = o['fecha_pago'] ??
                      o['paid_at'] ??
                      o['created_at'] ??
                      o['updated_at'];
                  final fechaPago = _parseDate(fechaRaw);

                  final totalRaw = o['pago_total'] ?? o['total'];
                  final double total = totalRaw is num
                      ? (totalRaw).toDouble()
                      : (double.tryParse(totalRaw?.toString() ?? '') ?? 0.0);

                  return _OrderCard(
                    orderId: orderId,
                    numeroOrden: numeroOrden,
                    status: status,
                    statusColor: _getStatusColor(status),
                    statusIcon: _getStatusIcon(status),
                    statusText: _getStatusText(status),
                    fechaPago: fechaPago,
                    total: total,
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
                      final auth =
                          context.read<AuthBloc>().state as AuthSuccess;

                      if (!context.mounted) return;
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BlocProvider(
                            create: (_) =>
                                OrderDetailCubit(auth.token)..fetch(orderId),
                            child: OrderDetailPageView(orderId: orderId),
                          ),
                        ),
                      );
                    },
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

/// 🎴 Card de orden mejorado
class _OrderCard extends StatelessWidget {
  final int orderId;
  final String numeroOrden;
  final String status;
  final Color statusColor;
  final IconData statusIcon;
  final String statusText;
  final DateTime? fechaPago;
  final double total;
  final VoidCallback onTap;

  const _OrderCard({
    required this.orderId,
    required this.numeroOrden,
    required this.status,
    required this.statusColor,
    required this.statusIcon,
    required this.statusText,
    required this.fechaPago,
    required this.total,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: Número de orden y estado
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Número de orden
                    Expanded(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFFD95D85),
                                  Color(0xFFE58BB1),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.receipt_long_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Orden',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '#$numeroOrden',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Badge de estado
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: statusColor.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            statusIcon,
                            size: 14,
                            color: statusColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            statusText,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Divider decorativo
                Container(
                  height: 1,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.grey[200]!,
                        Colors.grey[100]!,
                        Colors.grey[200]!,
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Footer: Fecha y total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Fecha
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFEEF3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.calendar_today_rounded,
                            size: 16,
                            color: Color(0xFFD95D85),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          fechaPago != null
                              ? '${fechaPago!.day.toString().padLeft(2, '0')}/${fechaPago!.month.toString().padLeft(2, '0')}/${fechaPago!.year}'
                              : '—',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),

                    // Total con icono de flecha
                    Row(
                      children: [
                        Text(
                          formatPriceCOP(total.toInt()),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFD95D85),
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFEEF3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 12,
                            color: Color(0xFFD95D85),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
