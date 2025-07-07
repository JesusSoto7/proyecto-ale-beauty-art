import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final int id;
  final String nombreProducto;
  final double precioProducto;
  final String descripcion;
  final int categoryId;
  final int stock;
  final String nombreCategoria;
  final String? imagenUrl;

String get fullImageUrl {
  if (imagenUrl == null || imagenUrl!.isEmpty) {
    return '';
  }
  //Aqui colocan la ip de su pc para q les cargen las imagenes q agregen a los productos
  const String localIp = 'xxx.xxx.xx.xxx';

  if (imagenUrl!.contains('localhost')) {
    return imagenUrl!.replaceFirst('localhost', localIp);
  }
  return imagenUrl!;
}

  const Product({
    required this.id,
    required this.nombreProducto,
    required this.precioProducto,
    required this.descripcion,
    required this.categoryId,
    required this.stock,
    required this.nombreCategoria,
    required this.imagenUrl
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      nombreProducto: json['nombre_producto'],
      descripcion: json['descripcion'],
      categoryId: json['category_id'],
      precioProducto: json['precio_producto'],
      stock: json['stock'],
      nombreCategoria: json['category']['nombre_categoria'],
      imagenUrl: json['imagen_url']
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre_producto': nombreProducto,
    'description': descripcion,
    'category_id': categoryId,
    'precio_producto': precioProducto,
    'stock': stock,
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
    nombreCategoria,
    imagenUrl
  ];
}
