import 'package:equatable/equatable.dart';


class Product extends Equatable {
  int? id;
  String? name;
  String? description;
  double? price;
  int? stock;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      stock: json['stock'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'stock': stock,
      };

  @override
  List<Object?> get props => [id, name, description, price, stock];
}

