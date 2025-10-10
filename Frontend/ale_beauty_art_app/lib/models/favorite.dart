class FavoriteProduct {
  final int id;
  final String slug;
  final String nombreProducto;
  final double precioProducto;
  final int stock;
  final String? imagenUrl;
  final String? categoria;
  final String fechaAgregado;

  FavoriteProduct({
    required this.id,
    required this.slug,
    required this.nombreProducto,
    required this.precioProducto,
    required this.stock,
    this.imagenUrl,
    this.categoria,
    required this.fechaAgregado,
  });

  factory FavoriteProduct.fromJson(Map<String, dynamic> json) {
    return FavoriteProduct(
      id: json['id'],
      slug: json['slug'],
      nombreProducto: json['nombre_producto'],
      precioProducto: (json['precio_producto'] as num).toDouble(),
      stock: json['stock'],
      imagenUrl: json['imagen_url'],
      categoria: json['categoria'],
      fechaAgregado: json['fecha_agregado'],
    );
  }
}
