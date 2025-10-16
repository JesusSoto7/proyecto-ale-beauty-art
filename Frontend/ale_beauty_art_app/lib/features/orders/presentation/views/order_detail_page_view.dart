import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/cubit/order_detail_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';

class OrderDetailPageView extends StatefulWidget {
  final int orderId;
  const OrderDetailPageView({super.key, required this.orderId});

  @override
  State<OrderDetailPageView> createState() => _OrderDetailPageViewState();
}

class _OrderDetailPageViewState extends State<OrderDetailPageView> {
  @override
  void initState() {
    super.initState();
  }

  Future<void> _refresh() async {
    context.read<OrderDetailCubit>().fetch(widget.orderId);
  }

  String _text(dynamic v, {String fallback = '—'}) {
    if (v == null) return fallback;
    final s = v.toString().trim();
    return s.isEmpty ? fallback : s;
  }

  DateTime? _date(dynamic v) {
    if (v == null) return null;
    if (v is int) {
      final isSeconds = v.toString().length == 10;
      final dt = DateTime.fromMillisecondsSinceEpoch(isSeconds ? v * 1000 : v, isUtc: true);
      return dt.toLocal();
    }
    final dt = DateTime.tryParse(v.toString());
    return dt?.toLocal();
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
              'Detalle de pedido',
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
      body: BlocBuilder<OrderDetailCubit, OrderDetailState>(
        builder: (context, state) {
          if (state is OrderDetailLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is OrderDetailError) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 120),
                children: [
                  Center(child: Text(state.message)),
                  const SizedBox(height: 8),
                  const Center(child: Text('Desliza para reintentar')),
                ],
              ),
            );
          }
          if (state is OrderDetailLoaded) {
            final o = state.order;
            final numero = _text(o['numero_de_orden'] ?? o['id']);
            final status = _text(o['status']).toUpperCase();
            final totalRaw = o['pago_total'] ?? o['total'];
            final total = totalRaw is num
                ? (totalRaw).toDouble()
                : (double.tryParse(totalRaw?.toString() ?? '') ?? 0.0);
            final fechaRaw = o['fecha_pago'] ?? o['paid_at'] ?? o['created_at'] ?? o['updated_at'];
            final fecha = _date(fechaRaw);
            final direccion = _text(o['direccion_envio'] ?? o['shipping_address'], fallback: 'No disponible');
            final cardType = _text(o['tarjeta_tipo'] ?? o['card_type'], fallback: '');
            final last4 = _text(o['tarjeta_ultimos4'] ?? o['card_last4'], fallback: '');
            final productos = (o['productos'] as List?) ?? [];

            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Container(
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
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
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
                                      'Orden #$numero',
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
                                          fecha != null
                                              ? '${fecha.day.toString().padLeft(2, '0')}/${fecha.month.toString().padLeft(2, '0')}/${fecha.year}'
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
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
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
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.local_shipping_outlined, size: 18),
                              const SizedBox(width: 6),
                              Expanded(child: Text(direccion)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.credit_card, size: 18),
                              const SizedBox(width: 6),
                              if (cardType.isNotEmpty || last4.isNotEmpty)
                                Text('${cardType.isNotEmpty ? cardType.toUpperCase() : 'Tarjeta'} •••• $last4')
                              else
                                const Text('Pago no disponible'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
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
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Productos', style: TextStyle(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 8),
                          ...productos.map((p) {
                            final mp = p as Map<String, dynamic>;
                            final nombre = _text(mp['nombre_producto'] ?? mp['name']);
                            final cantidadRaw = mp['cantidad'] ?? 1;
                            final cantidad = int.tryParse(cantidadRaw.toString()) ?? 1;
                            final precioRaw = mp['precio_unitario'] ?? mp['precio_producto'] ?? 0;
                            final precio = precioRaw is num
                                ? (precioRaw).toDouble()
                                : (double.tryParse(precioRaw.toString()) ?? 0.0);
                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              title: Text(nombre),
                              subtitle: Text('Cantidad: $cantidad'),
                              trailing: Text(formatPriceCOP(precio)),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}