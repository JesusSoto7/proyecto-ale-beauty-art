import 'package:ale_beauty_art_app/models/OrderProduct.dart';

class Order {
  final int id;
  final String numeroDeOrden;
  final String status;
  final double pagoTotal;
  final DateTime? fechaPago;
  final List<OrderProduct> productos;

  Order({
    required this.id,
    required this.numeroDeOrden,
    required this.status,
    required this.pagoTotal,
    this.fechaPago,
    required this.productos,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      numeroDeOrden: json['numero_de_orden'],
      status: json['status'],
      pagoTotal: double.parse(json['pago_total'].toString()),
      fechaPago: json['fecha_pago'] != null
          ? DateTime.tryParse(json['fecha_pago'])
          : null,
      productos: (json['productos'] as List)
          .map((p) => OrderProduct.fromJson(p))
          .toList(),
    );
  }
}
