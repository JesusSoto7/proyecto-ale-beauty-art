import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final int id;
  final String nombreProducto;
  final int precioProducto;
  final String descripcion;
  final int subCategoryId;
  final int stock;
  final String nombreSubCategoria;
  final int categoryId;
  final String nombreCategoria;
  final String? imagenUrl;

  const Product({
    required this.id,
    required this.nombreProducto,
    required this.precioProducto,
    required this.descripcion,
    required this.subCategoryId,
    required this.stock,
    required this.nombreSubCategoria,
    required this.categoryId,
    required this.nombreCategoria,
    required this.imagenUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final subCategory = json['sub_category'] ?? {};
    final category = subCategory['category'] ?? {};

    return Product(
      id: json['id'] ?? 0,
      nombreProducto: json['nombre_producto'] ?? '',
      descripcion: json['descripcion'] ?? '',
      subCategoryId: subCategory['id'] ?? 0,
      stock: json['stock'] ?? 0,
      nombreSubCategoria: subCategory['nombre'] ?? '',
      categoryId: category['id'] ?? 0,
      nombreCategoria: category['nombre_categoria'] ?? '',
      precioProducto: json['precio_producto'] ?? 0,
      imagenUrl: json['imagen_url'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre_producto': nombreProducto,
    'description': descripcion,
    'sub_category_id': subCategoryId,
    'category_id': categoryId,
    'precio_producto': precioProducto,
    'stock': stock,
    'sub_category': {
      'nombre': nombreSubCategoria
    },
    'category': {
      'nombre_categoria': nombreCategoria
    },
    'imagen_url': imagenUrl
  };

  @override
  List<Object?> get props => [
    id,
    nombreProducto,
    descripcion,
    precioProducto,
    stock,
    nombreSubCategoria,
    categoryId,
    nombreCategoria,
    imagenUrl
  ];
}
