import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/cubit/order_detail_cubit.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/models/product.dart';
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
      final dt = DateTime.fromMillisecondsSinceEpoch(isSeconds ? v * 1000 : v,
          isUtc: true);
      return dt.toLocal();
    }
    final dt = DateTime.tryParse(v.toString());
    return dt?.toLocal();
  }

  double _parsePrice(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) {
      final parsed = double.tryParse(value);
      return parsed ?? 0.0;
    }
    try {
      return (value as num).toDouble();
    } catch (e) {
      return 0.0;
    }
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
              'Detalle del Pedido',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ),
      body: BlocBuilder<OrderDetailCubit, OrderDetailState>(
        builder: (context, state) {
          if (state is OrderDetailLoading) {
            return const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFD95D85),
              ),
            );
          }

          if (state is OrderDetailError) {
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

          if (state is OrderDetailLoaded) {
            final o = state.order;
            final numero = _text(o['numero_de_orden'] ?? o['id']);
            final status = _text(o['status']);
            final totalRaw = o['pago_total'] ?? o['total'];
            final total = _parsePrice(totalRaw);
            final fechaRaw = o['fecha_pago'] ??
                o['paid_at'] ??
                o['created_at'] ??
                o['updated_at'];
            final fecha = _date(fechaRaw);
            final direccion = _text(
                o['direccion_envio'] ?? o['shipping_address'],
                fallback: 'No disponible');
            final cardType =
                _text(o['tarjeta_tipo'] ?? o['card_type'], fallback: '');
            final last4 =
                _text(o['tarjeta_ultimos4'] ?? o['card_last4'], fallback: '');
            final productos = (o['productos'] as List?) ?? [];

            // 💰 Cálculo de precios con descuentos
            double subtotal = 0;
            double totalDescuentos = 0;

            for (final p in productos) {
              final mp = (p as Map<String, dynamic>);
              final cantidad =
                  int.tryParse(mp['cantidad']?.toString() ?? '1') ?? 1;

              // 🔥 USAR LOS CAMPOS CORRECTOS DEL BACKEND
              final precioOriginal =
                  _parsePrice(mp['precio_producto']); // Precio original
              final precioConDescuento =
                  _parsePrice(mp['precio_descuento']); // Precio con descuento

              subtotal += precioOriginal * cantidad;

              // Calcular descuento si existe
              if (precioConDescuento > 0 &&
                  precioConDescuento < precioOriginal) {
                totalDescuentos +=
                    (precioOriginal - precioConDescuento) * cantidad;
              }
            }

            final envioRaw = o['envio'] ?? 10000;
            final envio = _parsePrice(envioRaw);

            final subtotalConDescuento = subtotal - totalDescuentos;
            final totalCalculado =
                (total > 0) ? total : (subtotalConDescuento + envio);

            return RefreshIndicator(
              color: const Color(0xFFD95D85),
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // 🎯 Header con número de orden y estado
                  _StatusCard(
                    numero: numero,
                    status: status,
                    statusColor: _getStatusColor(status),
                    statusIcon: _getStatusIcon(status),
                  ),

                  const SizedBox(height: 16),

                  // 📋 Información general
                  _CardContainer(
                    title: 'Información del Pedido',
                    child: Column(
                      children: [
                        _InfoRow(
                          icon: Icons.calendar_today_rounded,
                          title: 'Fecha de pago',
                          value: fecha != null
                              ? '${fecha.day.toString().padLeft(2, '0')}/${fecha.month.toString().padLeft(2, '0')}/${fecha.year}'
                              : '—',
                        ),
                        const SizedBox(height: 16),
                        _InfoRow(
                          icon: Icons.location_on_rounded,
                          title: 'Dirección de envío',
                          value: direccion,
                        ),
                        const SizedBox(height: 16),
                        _InfoRow(
                          icon: Icons.credit_card_rounded,
                          title: 'Método de pago',
                          value: (cardType.isNotEmpty || last4.isNotEmpty)
                              ? '${cardType.toUpperCase()} •••• $last4'
                              : 'Pago no disponible',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // 📦 Productos
                  _ProductsCard(productos: productos, parsePrice: _parsePrice),

                  const SizedBox(height: 16),

                  // 💰 Totales
                  _TotalsCard(
                    subtotal: subtotal,
                    descuentos: totalDescuentos,
                    envio: envio,
                    total: totalCalculado,
                  ),

                  const SizedBox(height: 20),
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

// ============ WIDGETS AUXILIARES ============

/// 🎯 Card de estado con diseño destacado
class _StatusCard extends StatelessWidget {
  final String numero;
  final String status;
  final Color statusColor;
  final IconData statusIcon;

  const _StatusCard({
    required this.numero,
    required this.status,
    required this.statusColor,
    required this.statusIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFD95D85),
            Color(0xFFE58BB1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD95D85).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Orden',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '#$numero',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    statusIcon,
                    size: 18,
                    color: statusColor,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 📦 Container base para cards
class _CardContainer extends StatelessWidget {
  final Widget child;
  final String? title;

  const _CardContainer({required this.child, this.title});

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
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (title != null) ...[
              Text(
                title!,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 16),
            ],
            child,
          ],
        ),
      ),
    );
  }
}

/// 📋 Fila de información
class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFFFEEF3),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            size: 20,
            color: const Color(0xFFD95D85),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// 📦 Card de productos
class _ProductsCard extends StatelessWidget {
  final List productos;
  final Function(dynamic) parsePrice;

  const _ProductsCard({
    required this.productos,
    required this.parsePrice,
  });

  @override
  Widget build(BuildContext context) {
    return _CardContainer(
      title: 'Productos (${productos.length})',
      child: Column(
        children: productos.asMap().entries.map((entry) {
          final index = entry.key;
          final p = entry.value;
          final mp = p as Map<String, dynamic>;
          final nombre = mp['nombre_producto'] ?? mp['name'] ?? 'Producto';
          final cantidad = int.tryParse(mp['cantidad']?.toString() ?? '1') ?? 1;

          // 💰 USAR LOS CAMPOS CORRECTOS
          final precioOriginal =
              parsePrice(mp['precio_producto']); // Precio original
          final precioConDescuento =
              parsePrice(mp['precio_descuento']); // Precio con descuento

          final tieneDescuento =
              precioConDescuento > 0 && precioConDescuento < precioOriginal;

          // Calcular porcentaje de descuento
          int porcentajeDescuento = 0;
          if (tieneDescuento && precioOriginal > 0) {
            porcentajeDescuento =
                (((precioOriginal - precioConDescuento) / precioOriginal) * 100)
                    .round();
          }

          final imagen = mp['imagen_url'] ?? mp['product']?['imagen_url'];

          final dynamic prodIdDyn =
              mp['product_id'] ?? mp['id'] ?? mp['product']?['id'];
          final int productId = prodIdDyn is int
              ? prodIdDyn
              : int.tryParse(prodIdDyn?.toString() ?? '') ?? 0;

          return Column(
            children: [
              if (index > 0) const Divider(height: 24),
              InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () {
                  if (productId <= 0) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Producto sin información de detalle'),
                        backgroundColor: Color(0xFFD95D85),
                      ),
                    );
                    return;
                  }

                  Product product;
                  final rawProd = mp['product'];

                  if (rawProd is Map<String, dynamic>) {
                    try {
                      product = Product.fromJson(rawProd);
                    } catch (_) {
                      product = Product(
                        id: productId,
                        nombreProducto: rawProd['nombre_producto'] ?? nombre,
                        precioProducto:
                            (rawProd['precio_producto'] ?? precioOriginal)
                                .round(),
                        descripcion: rawProd['descripcion']?.toString() ?? '',
                        subCategoryId:
                            (rawProd['sub_category']?['id'] ?? 0) as int,
                        stock: rawProd['stock'] ?? 0,
                        nombreSubCategoria:
                            rawProd['sub_category']?['nombre']?.toString() ??
                                '',
                        categoryId:
                            rawProd['sub_category']?['category']?['id'] ?? 0,
                        nombreCategoria: rawProd['sub_category']?['category']
                                    ?['nombre_categoria']
                                ?.toString() ??
                            '',
                        imagenUrl: rawProd['imagen_url'] ?? imagen?.toString(),
                      );
                    }
                  } else {
                    final subCat = mp['sub_category'] as Map<String, dynamic>?;
                    final cat = subCat?['category'] ??
                        mp['category'] as Map<String, dynamic>?;

                    product = Product(
                      id: productId,
                      nombreProducto: nombre,
                      precioProducto: precioOriginal.round(),
                      descripcion: mp['descripcion']?.toString() ?? '',
                      subCategoryId: subCat?['id'] ?? 0,
                      stock: int.tryParse(mp['stock']?.toString() ?? '') ??
                          cantidad,
                      nombreSubCategoria: subCat?['nombre']?.toString() ?? '',
                      categoryId: cat?['id'] ?? 0,
                      nombreCategoria:
                          cat?['nombre_categoria']?.toString() ?? '',
                      imagenUrl: imagen?.toString(),
                    );
                  }

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ProductDetailView(product: product),
                    ),
                  );
                },
                child: Row(
                  children: [
                    // Imagen del producto con badge de descuento
                    Stack(
                      children: [
                        Container(
                          width: 70,
                          height: 70,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAFAFA),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.grey[200]!,
                              width: 1,
                            ),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: (imagen != null &&
                                    imagen.toString().isNotEmpty)
                                ? Image.network(
                                    imagen,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.image_not_supported_rounded,
                                      color: Colors.grey,
                                    ),
                                  )
                                : const Icon(
                                    Icons.image_outlined,
                                    color: Colors.grey,
                                    size: 30,
                                  ),
                          ),
                        ),
                        // 🏷️ Badge de descuento
                        if (tieneDescuento && porcentajeDescuento > 0)
                          Positioned(
                            top: 2,
                            left: 2,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFFFF6B9D),
                                    Color(0xFFFF8FB3),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(6),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFFFF6B9D)
                                        .withOpacity(0.4),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Text(
                                '-$porcentajeDescuento%',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 14),

                    // Info del producto
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nombre,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEEF3),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Cantidad: $cantidad',
                              style: const TextStyle(
                                color: Color(0xFFD95D85),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Precio con descuento
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (tieneDescuento) ...[
                          // Precio original tachado
                          Text(
                            formatPriceCOP(precioOriginal.toInt()),
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey[500],
                              decoration: TextDecoration.lineThrough,
                              decorationColor: Colors.grey[400],
                              decorationThickness: 1.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                        ],
                        // Precio final pagado
                        Text(
                          formatPriceCOP(precioConDescuento.toInt()),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: tieneDescuento
                                ? const Color(0xFFD95D85)
                                : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'c/u',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

/// 💰 Card de totales
class _TotalsCard extends StatelessWidget {
  final double subtotal;
  final double descuentos;
  final double envio;
  final double total;

  const _TotalsCard({
    required this.subtotal,
    required this.descuentos,
    required this.envio,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    return _CardContainer(
      title: 'Resumen de Pago',
      child: Column(
        children: [
          _TotalRow(
            label: 'Subtotal',
            value: formatPriceCOP(subtotal.toInt()),
          ),
          if (descuentos > 0) ...[
            const SizedBox(height: 12),
            _TotalRow(
              label: 'Descuentos',
              value: '-${formatPriceCOP(descuentos.toInt())}',
              isDiscount: true,
            ),
          ],
          const SizedBox(height: 12),
          _TotalRow(
            label: 'Envío',
            value: formatPriceCOP(envio.toInt()),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFEEF3), Color(0xFFFFF5F8)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total Pagado',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  formatPriceCOP(total.toInt()),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD95D85),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Fila de total
class _TotalRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isDiscount;

  const _TotalRow({
    required this.label,
    required this.value,
    this.isDiscount = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 15,
            color: isDiscount ? const Color(0xFFD95D85) : Colors.black87,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: isDiscount ? const Color(0xFFD95D85) : Colors.black87,
          ),
        ),
      ],
    );
  }
}
