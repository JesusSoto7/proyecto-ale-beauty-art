import 'package:flutter/material.dart';
import '../../../../../models/category.dart';
import '../../../../../models/product.dart';
import '../../../products/presentation/views/products_by_category_view.dart';
import 'subcategories_view.dart';

class CategoriesListView extends StatelessWidget {
  final List<Category> categories;
  final List<Product> allProducts;

  const CategoriesListView({
    super.key,
    required this.categories,
    required this.allProducts,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];

        return Card(
          child: ListTile(
          leading: ClipOval(
              child: Image.network(
                category.imagen,
                width: 80,
                height: 80,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 80,
                  height: 80,
                  color: Colors.grey[300],
                  child: const Icon(Icons.broken_image, color: Colors.grey),
                ),
              ),
            ),
            title: Text(category.nombreCategoria),
            onTap: () {
              // Filtro por ID
              final filtered = allProducts
                  .where((p) => p.categoryId == category.id)
                  .toList();
              final hasSubcats = filtered.any((p) => p.subCategoryId != 0);
              if (hasSubcats) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SubCategoriesView(
                      categoryId: category.id,
                      categoryName: category.nombreCategoria,
                      allProductsInCategory: filtered,
                    ),
                  ),
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ProductsByCategoryView(
                      categoryId: category.id,
                      categoryName: category.nombreCategoria,
                      products: filtered,
                    ),
                  ),
                );
              }
            },
          ),
        );
      },
    );
  }
}
