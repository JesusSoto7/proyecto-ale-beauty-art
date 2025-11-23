import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../models/product.dart';
import '../../../../models/subcategory.dart';
import '../../../../core/http/custom_http_client.dart';
import '../../../../core/views/loading_view.dart';
import '../../../../core/views/failure_view.dart';
import '../../../../models/sub_category_item.dart';
import '../widgets/sub_category_card.dart';

class SubCategoriesView extends StatefulWidget {
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
  State<SubCategoriesView> createState() => _SubCategoriesViewState();
}

class _SubCategoriesViewState extends State<SubCategoriesView> {
  late Future<List<SubCategory>> _future;

  @override
  void initState() {
    super.initState();
    _future = _fetchSubCategories(widget.categoryId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Colors.black87,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            title: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.categoryName,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w600,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<SubCategory>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return const FailureView();
          }
            
          final subs = snapshot.data ?? [];
          final items = _mapToItems(subs);

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
                return SubCategoryCard(item: item);
              },
            ),
          );
        },
      ),
    );
  }

  List<SubCategoryItem> _mapToItems(List<SubCategory> subs) {
    return subs.map((sc) {
      final products = widget.allProductsInCategory
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

      return SubCategoryItem(
        id: sc.id,
        name: sc.nombre,
        count: products.length,
        previewImage: previewImage,
        products: products,
      );
    }).toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
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
          Text(
            'subcategories.empty_title'.tr(),
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'subcategories.empty_subtitle'.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
