class SubCategory {
  final int id;
  final String nombre;
  final Category? category;

  SubCategory({
    required this.id,
    required this.nombre,
    this.category,
  });

  factory SubCategory.fromJson(Map<String, dynamic> json) {
    return SubCategory(
      id: json['id'],
      nombre: json['nombre'],
      category:
          json['category'] != null ? Category.fromJson(json['category']) : null,
    );
  }
}

class Category {
  final int id;
  final String nombreCategoria;

  Category({
    required this.id,
    required this.nombreCategoria,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      nombreCategoria: json['nombre_categoria'],
    );
  }
}
