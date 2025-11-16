import 'product.dart';

class SubCategoryItem {
  final int id;
  final String name;
  final int count;
  final String previewImage;
  final List<Product> products;

  const SubCategoryItem({
    required this.id,
    required this.name,
    required this.count,
    required this.previewImage,
    required this.products,
  });
}
