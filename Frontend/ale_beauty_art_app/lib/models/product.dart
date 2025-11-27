import 'package:ale_beauty_art_app/models/discount.dart';
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
  // Imagen asociada a la subcategoría (si el backend la entrega en sub_category.imagen_url)
  final String? subCategoryImagenUrl;
  final String? slug;
  final double? averageRating;
  final int? reviewsCount;

  final Discount? discount;
  final Discount? mejorDescuentoParaPrecio;
  final double? precioConMejorDescuento;
  // IVA related fields (optional, supplied by cart endpoints)
  final double? precioUnitarioSinIva;
  final double? ivaPorUnidad;
  final double? precioUnitarioConIva;
  final double? totalLineConIva;

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
    this.slug,
    this.averageRating,
    this.reviewsCount,
    this.subCategoryImagenUrl,
    this.discount,
    this.mejorDescuentoParaPrecio,
    this.precioConMejorDescuento,
    this.precioUnitarioSinIva,
    this.ivaPorUnidad,
    this.precioUnitarioConIva,
    this.totalLineConIva,
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
      slug: json['slug']?.toString(),
      // Intentar mapear imagen de subcategoría si viene del backend
      subCategoryImagenUrl: subCategory['imagen_url'] ?? subCategory['imagen'],
      // 🆕 Parsear descuentos
      discount:
          json['discount'] != null ? Discount.fromJson(json['discount']) : null,
      mejorDescuentoParaPrecio: json['mejor_descuento_para_precio'] != null
          ? Discount.fromJson(json['mejor_descuento_para_precio'])
          : null,
      precioConMejorDescuento: json['precio_con_mejor_descuento'] != null
          ? (json['precio_con_mejor_descuento'] is String
              ? double.tryParse(json['precio_con_mejor_descuento'])
              : (json['precio_con_mejor_descuento'] as num?)?.toDouble())
          : null,
        // ratings (optional)
        averageRating: json['average_rating'] != null
          ? (json['average_rating'] is String
            ? double.tryParse(json['average_rating'])
            : (json['average_rating'] as num?)?.toDouble())
          : (json['average'] != null
            ? (json['average'] is String
              ? double.tryParse(json['average'])
              : (json['average'] as num?)?.toDouble())
            : null),
        reviewsCount: json['reviews_count'] != null
          ? (json['reviews_count'] is String
            ? int.tryParse(json['reviews_count'])
            : (json['reviews_count'] as num?)?.toInt())
          : null,
          // IVA fields (opcionales)
          precioUnitarioSinIva: json['precio_unitario_sin_iva'] != null
            ? (json['precio_unitario_sin_iva'] is String
              ? double.tryParse(json['precio_unitario_sin_iva'])
              : (json['precio_unitario_sin_iva'] as num?)?.toDouble())
            : null,
          ivaPorUnidad: json['iva_por_unidad'] != null
            ? (json['iva_por_unidad'] is String
              ? double.tryParse(json['iva_por_unidad'])
              : (json['iva_por_unidad'] as num?)?.toDouble())
            : null,
          precioUnitarioConIva: json['precio_unitario_con_iva'] != null
            ? (json['precio_unitario_con_iva'] is String
              ? double.tryParse(json['precio_unitario_con_iva'])
              : (json['precio_unitario_con_iva'] as num?)?.toDouble())
            : null,
          totalLineConIva: json['total_line_con_iva'] != null
            ? (json['total_line_con_iva'] is String
              ? double.tryParse(json['total_line_con_iva'])
              : (json['total_line_con_iva'] as num?)?.toDouble())
            : null,
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
        'sub_category': {'nombre': nombreSubCategoria},
        'category': {'nombre_categoria': nombreCategoria},
        'imagen_url': imagenUrl,
        if (slug != null) 'slug': slug,
        if (subCategoryImagenUrl != null)
          'sub_category_imagen_url': subCategoryImagenUrl,
        if (discount != null) 'discount': discount!.toJson(),
        if (mejorDescuentoParaPrecio != null)
          'mejor_descuento_para_precio': mejorDescuentoParaPrecio!.toJson(),
        if (precioConMejorDescuento != null)
          'precio_con_mejor_descuento': precioConMejorDescuento,
        if (precioUnitarioSinIva != null)
          'precio_unitario_sin_iva': precioUnitarioSinIva,
        if (ivaPorUnidad != null) 'iva_por_unidad': ivaPorUnidad,
        if (precioUnitarioConIva != null)
          'precio_unitario_con_iva': precioUnitarioConIva,
        if (totalLineConIva != null) 'total_line_con_iva': totalLineConIva,
        if (averageRating != null) 'average_rating': averageRating,
        if (reviewsCount != null) 'reviews_count': reviewsCount,
      };

  // 🆕 Método helper para saber si tiene descuento activo
  bool get tieneDescuento =>
      mejorDescuentoParaPrecio != null &&
      precioConMejorDescuento != null &&
      precioConMejorDescuento! < precioProducto;

  // 🆕 Calcular porcentaje de descuento
  int get porcentajeDescuento {
    if (!tieneDescuento) return 0;
    final descuento =
        ((precioProducto - precioConMejorDescuento!) / precioProducto) * 100;
    return descuento.round();
  }

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
        imagenUrl,
    slug,
      averageRating,
      reviewsCount,
      subCategoryImagenUrl,
        discount,
        mejorDescuentoParaPrecio,
        precioConMejorDescuento,
        precioUnitarioSinIva,
        ivaPorUnidad,
        precioUnitarioConIva,
        totalLineConIva,
      ];
}
