import 'package:flutter/material.dart';
import '../../../products/presentation/views/products_by_category_view.dart';
import '../../../../models/sub_category_item.dart';

class SubCategoryCard extends StatelessWidget {
  final SubCategoryItem item;
  const SubCategoryCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductsByCategoryView(
              categoryId: item.id, // reused as subcategory id
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
              color: Colors.black.withValues(alpha: 0.06),
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
          ],
        ),
      ),
    );
  }
}
