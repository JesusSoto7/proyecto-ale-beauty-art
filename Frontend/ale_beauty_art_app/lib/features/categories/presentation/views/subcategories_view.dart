import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../models/product.dart';
import '../../../../models/subcategory.dart';
import '../../../../core/http/custom_http_client.dart';
import '../../../products/presentation/views/products_by_category_view.dart';

class SubCategoriesView extends StatelessWidget {
  final int categoryId;
  final String categoryName;
  final List<Product> allProductsInCategory;

  const SubCategoriesView({
    super.key,
    required this.categoryId,
    required this.categoryName,
    required this.allProductsInCategory,
  });

  @override
  Widget build(BuildContext context) {
    final future = _fetchSubCategories(categoryId);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            systemOverlayStyle: SystemUiOverlayStyle.dark,
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Color(0xFFD95D85),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  categoryName,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 2),
                FutureBuilder<List<SubCategory>>(
                  future: future,
                  builder: (context, snap) {
                    final count = (snap.data ?? []).length;
                    final label = count == 0
                        ? 'Sin subcategorías'
                        : '$count ${count == 1 ? 'subcategoría' : 'subcategorías'}';
                    return Text(
                      label,
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<SubCategory>>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _emptyState();
          }
          final subs = snapshot.data ?? [];
          // Mapear a items con conteo de productos y preview
          final items = subs.map((sc) {
            final products = allProductsInCategory
                .where((p) => p.subCategoryId == sc.id)
                .toList();
            String previewImage = '';
            if (sc.imagen.isNotEmpty) {
              previewImage = sc.imagen;
            } else if (products.any((p) => (p.subCategoryImagenUrl ?? '').isNotEmpty)) {
              previewImage = products
                      .firstWhere((p) => (p.subCategoryImagenUrl ?? '').isNotEmpty)
                      .subCategoryImagenUrl ??
                  '';
            } else if (products.any((p) => (p.imagenUrl ?? '').isNotEmpty)) {
              previewImage = products
                      .firstWhere((p) => (p.imagenUrl ?? '').isNotEmpty)
                      .imagenUrl ??
                  '';
            }

            return _SubCategoryItem(
              id: sc.id,
              name: sc.nombre,
              count: products.length,
              previewImage: previewImage,
              products: products,
            );
          }).toList()
            ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));

          if (items.isEmpty) return _emptyState();

          return Padding(
            padding: const EdgeInsets.all(12.0),
            child: GridView.builder(
              padding: const EdgeInsets.only(top: 8),
              itemCount: items.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 12,
                childAspectRatio: 0.95,
              ),
              itemBuilder: (context, index) {
                final item = items[index];
                return _SubCategoryCard(item: item);
              },
            ),
          );
        },
      ),
    );
  }

  Future<List<SubCategory>> _fetchSubCategories(int categoryId) async {
    try {
      final res = await CustomHttpClient.getRequest(
        '/api/v1/categories/$categoryId/sub_categories',
        headers: const {'Content-Type': 'application/json'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as List<dynamic>;
        return data.map((e) => SubCategory.fromJson(e as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Color(0xFFFFEEF3),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.category_outlined,
              size: 64,
              color: Color(0xFFD95D85),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'No hay subcategorías',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Aún no hay subcategorías disponibles\npara esta categoría',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

class _SubCategoryItem {
  final int id;
  final String name;
  final int count;
  final String previewImage;
  final List<Product> products;
  _SubCategoryItem({
    required this.id,
    required this.name,
    required this.count,
    required this.previewImage,
    required this.products,
  });
}

class _SubCategoryCard extends StatelessWidget {
  final _SubCategoryItem item;
  const _SubCategoryCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductsByCategoryView(
              categoryId: item.id, // reutilizamos como id de subcategoría
              categoryName: item.name,
              products: item.products,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 48,
              backgroundColor: Colors.pink.shade50,
              backgroundImage: item.previewImage.isNotEmpty
                  ? NetworkImage(item.previewImage)
                  : null,
              child: item.previewImage.isEmpty
                  ? const Text(
                      '💄',
                      style: TextStyle(fontSize: 30),
                    )
                  : null,
            ),
            const SizedBox(height: 10),
            Text(
              item.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF374151),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${item.count} ${item.count == 1 ? 'producto' : 'productos'}',
              style: TextStyle(color: Colors.grey[600], fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
