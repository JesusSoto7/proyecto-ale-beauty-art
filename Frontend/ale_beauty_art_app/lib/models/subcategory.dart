class SubCategory {
  final int id;
  final String nombre;
  final String imagen; // imagen_url expuesta por el backend
  final String slug;
  final Category? category;

  SubCategory({
    required this.id,
    required this.nombre,
    this.imagen = '',
    this.slug = '',
    this.category,
  });

  factory SubCategory.fromJson(Map<String, dynamic> json) {
    return SubCategory(
      id: json['id'],
      nombre: json['nombre'],
      imagen: json['imagen_url'] ?? '',
      slug: json['slug'] ?? '',
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
