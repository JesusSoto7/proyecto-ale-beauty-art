import 'package:ale_beauty_art_app/models/OrderProduct.dart';

class Order {
  final int id;
  final String numeroDeOrden;
  final String status;
  final double pagoTotal;
  final DateTime? fechaPago;
  final List<OrderProduct> productos;
  final String direccionEnvio;
  final String tarjetaTipo;
  final String tarjetaUltimos4;

  Order({
    required this.id,
    required this.numeroDeOrden,
    required this.status,
    required this.pagoTotal,
    this.fechaPago,
    required this.productos,
    required this.direccionEnvio, 
    required this.tarjetaTipo, 
    required this.tarjetaUltimos4
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
      direccionEnvio: (json['direccion_envio'] ?? json['shipping_address'])!.toString(),
      tarjetaTipo: (json['tarjeta_tipo'] ?? json['card_type'])!.toString(),
      tarjetaUltimos4: (json['tarjeta_ultimos4'] ?? json['card_last4'])!.toString(),
    );
  }
}
