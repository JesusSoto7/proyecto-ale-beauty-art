import 'package:equatable/equatable.dart';

class Category extends Equatable{
  final int id;
  final String nombreCategoria;

  const Category({required this.id, required this.nombreCategoria});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(id: json['id'], nombreCategoria: json['nombre_categoria']);
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre_categoria': nombreCategoria,
  };

  @override
  List<Object?> get props => [id, nombreCategoria];
}
