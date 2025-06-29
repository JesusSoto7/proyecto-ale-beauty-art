import 'package:equatable/equatable.dart';

class Category extends Equatable{
  final int id;
  final String nombreCategoria;
  final String imagen;

  const Category({required this.id, required this.nombreCategoria,required this.imagen});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      nombreCategoria: json['nombre_categoria'],
      imagen: 'https://via.placeholder.com/150', // imagen por defecto
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre_categoria': nombreCategoria,
    'imagen': imagen,
  };

  @override
  List<Object?> get props => [id, nombreCategoria, imagen];
}
