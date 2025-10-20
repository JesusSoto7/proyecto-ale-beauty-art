import 'package:equatable/equatable.dart';

class Discount extends Equatable {
  final int id;
  final String nombre;
  final String? descripcion;
  final String tipo;
  final double valor;
  final String fechaInicio;
  final String? fechaFin;
  final bool activo;

  const Discount({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.tipo,
    required this.valor,
    required this.fechaInicio,
    this.fechaFin,
    required this.activo,
  });

  factory Discount.fromJson(Map<String, dynamic> json) {
    return Discount(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'],
      tipo: json['tipo'] ?? 'porcentaje',
      valor: (json['valor'] is String
          ? double.tryParse(json['valor']) ?? 0.0
          : (json['valor'] as num?)?.toDouble() ?? 0.0),
      fechaInicio: json['fecha_inicio'] ?? '',
      fechaFin: json['fecha_fin'],
      activo: json['activo'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre': nombre,
        'descripcion': descripcion,
        'tipo': tipo,
        'valor': valor,
        'fecha_inicio': fechaInicio,
        'fecha_fin': fechaFin,
        'activo': activo,
      };

  @override
  List<Object?> get props => [
        id,
        nombre,
        descripcion,
        tipo,
        valor,
        fechaInicio,
        fechaFin,
        activo,
      ];
}
