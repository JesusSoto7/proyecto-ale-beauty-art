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
      final dt = DateTime.fromMillisecondsSinceEpoch(isSeconds ? v * 1000 : v, isUtc: true);
      return dt.toLocal();
    }
    final dt = DateTime.tryParse(v.toString());
    return dt?.toLocal();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 3,
        centerTitle: true,
        title: const Text(
          'Detalle de pedido',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
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

            // Subtotal y envío
            double subtotal = 0;
            for (final p in productos) {
              final mp = (p as Map<String, dynamic>);
              final cantidad = int.tryParse(mp['cantidad']?.toString() ?? '1') ?? 1;
              final precioRaw = mp['precio_unitario'] ?? mp['precio_producto'] ?? 0;
              final precio = precioRaw is num
                  ? (precioRaw).toDouble()
                  : (double.tryParse(precioRaw.toString()) ?? 0.0);
              subtotal += cantidad * precio;
            }
            final envioRaw = o['envio'] ?? 10000;
            final envio = envioRaw is num ? envioRaw.toDouble() : (double.tryParse(envioRaw.toString()) ?? 10000.0);
            final totalCalculado = (total > 0) ? total : (subtotal + envio);

            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Cabecera con número de orden y estado
                  _CardContainer(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Orden #$numero',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2E1A2D),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.blueGrey.shade50,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(status, style: const TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Información general
                  _CardContainer(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _InfoRow(
                          icon: Icons.event_available_outlined,
                          title: 'Fecha de pago',
                          value: fecha != null
                              ? '${fecha.day.toString().padLeft(2, '0')}/${fecha.month.toString().padLeft(2, '0')}/${fecha.year}'
                              : '—',
                        ),
                        const Divider(),
                        _InfoRow(
                          icon: Icons.location_on_outlined,
                          title: 'Dirección de envío',
                          value: direccion,
                        ),
                        const Divider(),
                        _InfoRow(
                          icon: Icons.credit_card,
                          title: 'Método de pago',
                          value: (cardType.isNotEmpty || last4.isNotEmpty)
                              ? '${cardType.toUpperCase()} •••• $last4'
                              : 'Pago no disponible',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Productos y totales
                  _ProductsCard(productos: productos),
                  const SizedBox(height: 12),
                  _TotalsCard(subtotal: subtotal, envio: envio, total: totalCalculado),
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

// ---- Widgets auxiliares ----

class _CardContainer extends StatelessWidget {
  final Widget child;
  const _CardContainer({required this.child});

  @override
  Widget build(BuildContext context) {
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
      child: Padding(padding: const EdgeInsets.all(12), child: child),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  const _InfoRow({required this.icon, required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFFD95D85)),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(color: Colors.black87)),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProductsCard extends StatelessWidget {
  final List productos;
  const _ProductsCard({required this.productos});

  @override
  Widget build(BuildContext context) {
    return _CardContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Productos', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          ...productos.map((p) {
            final mp = p as Map<String, dynamic>;
            final nombre = mp['nombre_producto'] ?? mp['name'] ?? 'Producto';
            final cantidad = int.tryParse(mp['cantidad']?.toString() ?? '1') ?? 1;
            final precioRaw = mp['precio_unitario'] ?? mp['precio_producto'] ?? 0;
            final precio = precioRaw is num
                ? (precioRaw).toDouble()
                : (double.tryParse(precioRaw.toString()) ?? 0.0);
            final imagen = mp['imagen_url'] ?? mp['product']?['imagen_url'];

            // ID del producto para navegar (variaciones comunes)
            final dynamic prodIdDyn = mp['product_id'] ?? mp['id'] ?? mp['product']?['id'];
            final int productId = prodIdDyn is int
                ? prodIdDyn
                : int.tryParse(prodIdDyn?.toString() ?? '') ?? 0;

            return InkWell(
              borderRadius: BorderRadius.circular(10),
             onTap: () {
              if (productId <= 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Producto sin información de detalle')),
                );
                return;
              }

              Product product;
              final rawProd = mp['product'];

              if (rawProd is Map<String, dynamic>) {
                // ✅ Viene el producto completo, usamos el modelo
                try {
                  product = Product.fromJson(rawProd);
                } catch (_) {
                  product = Product(
                    id: productId,
                    nombreProducto: rawProd['nombre_producto'] ?? nombre,
                    precioProducto: (rawProd['precio_producto'] ?? precio).round(),
                    descripcion: rawProd['descripcion']?.toString() ?? '',
                    subCategoryId: (rawProd['sub_category']?['id'] ?? 0) as int,
                    stock: rawProd['stock'] ?? 0,
                    nombreSubCategoria: rawProd['sub_category']?['nombre']?.toString() ?? '',
                    categoryId: rawProd['sub_category']?['category']?['id'] ?? 0,
                    nombreCategoria: rawProd['sub_category']?['category']?['nombre_categoria']?.toString() ?? '',
                    imagenUrl: rawProd['imagen_url'] ?? imagen?.toString(),
                  );
                }
              } else {
                final subCat = mp['sub_category'] as Map<String, dynamic>?;
                final cat = subCat?['category'] ?? mp['category'] as Map<String, dynamic>?;

                product = Product(
                  id: productId,
                  nombreProducto: nombre,
                  precioProducto: precio.round(),
                  descripcion: mp['descripcion']?.toString() ?? '',
                  subCategoryId: subCat?['id'] ?? 0,
                  stock: int.tryParse(mp['stock']?.toString() ?? '') ?? cantidad,
                  nombreSubCategoria: subCat?['nombre']?.toString() ?? '',
                  categoryId: cat?['id'] ?? 0,
                  nombreCategoria: cat?['nombre_categoria']?.toString() ?? '',
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

              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 48,
                        height: 48,
                        color: Colors.pink.shade50,
                        child: (imagen != null && imagen.toString().isNotEmpty)
                            ? Image.network(imagen, fit: BoxFit.cover)
                            : const Icon(Icons.image_not_supported, color: Colors.grey),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(nombre, maxLines: 1, overflow: TextOverflow.ellipsis),
                          Text('Cantidad: $cantidad',
                              style: const TextStyle(color: Colors.black54, fontSize: 12)),
                        ],
                      ),
                    ),
                    Text(formatPriceCOP(precio)),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _TotalsCard extends StatelessWidget {
  final double subtotal;
  final double envio;
  final double total;
  const _TotalsCard({required this.subtotal, required this.envio, required this.total});

  @override
  Widget build(BuildContext context) {
    return _CardContainer(
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Subtotal:'),
            Text(formatPriceCOP(subtotal), style: const TextStyle(fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 6),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Envío:'),
            Text(formatPriceCOP(envio), style: const TextStyle(fontWeight: FontWeight.w600)),
          ]),
          const Divider(height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Total:', style: TextStyle(fontWeight: FontWeight.w700)),
            Text(
              formatPriceCOP(total),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFFD95D85),
              ),
            ),
          ]),
        ],
      ),
    );
  }
}
