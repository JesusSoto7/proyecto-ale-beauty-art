import 'package:equatable/equatable.dart';

class Category extends Equatable {
  final int id;
  final String nombreCategoria;
  final String imagen;

  const Category({
    required this.id,
    required this.nombreCategoria,
    required this.imagen,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      nombreCategoria: json['nombre_categoria'],
      imagen: json['imagen_url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nombre_categoria': nombreCategoria,
        'imagen_url': imagen,
      };

  @override
  List<Object?> get props => [id, nombreCategoria, imagen];
}
