class OrderProduct {
  final int id;
  final String nombreProducto;
  final String slug;
  final int cantidad;
  final double precioProducto;
  final String? imagenUrl;

  OrderProduct({
    required this.id,
    required this.nombreProducto,
    required this.slug,
    required this.cantidad,
    required this.precioProducto,
    this.imagenUrl,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) {
    return OrderProduct(
      id: json['id'],
      nombreProducto: json['nombre_producto'],
      slug: json['slug'],
      cantidad: json['cantidad'],
      precioProducto: double.parse(json['precio_producto'].toString()),
      imagenUrl: json['imagen_url'],
    );
  }
}


