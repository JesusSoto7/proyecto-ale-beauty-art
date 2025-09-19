class ShippingAddress {
  final int id;
  final String nombre;
  final String apellido;
  final String telefono;
  final String direccion;
  final String codigoPostal;
  final String indicacionesAdicionales;
  final bool predeterminada;
  final Map<String, dynamic>? neighborhood;
  final Map<String, dynamic>? municipality;
  final Map<String, dynamic>? department;

  ShippingAddress({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.telefono,
    required this.direccion,
    required this.codigoPostal,
    required this.indicacionesAdicionales,
    required this.predeterminada,
    this.neighborhood,
    this.municipality,
    this.department,
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      id: json['id'],
      nombre: json['nombre'] ?? '',
      apellido: json['apellido'] ?? '',
      telefono: json['telefono'] ?? '',
      direccion: json['direccion'] ?? '',
      codigoPostal: json['codigo_postal'] ?? '',
      indicacionesAdicionales: json['indicaciones_adicionales'] ?? '',
      predeterminada: json['predeterminada'] ?? false,
      neighborhood: json['neighborhood'],
      municipality: json['municipality'],
      department: json['department'],
    );
  }

  // Getters para acceder a los ids directamente
  String? get neighborhoodId => neighborhood?['id']?.toString();
  String? get municipalityId => municipality?['id']?.toString();
  String? get departmentId => department?['id']?.toString();
}
