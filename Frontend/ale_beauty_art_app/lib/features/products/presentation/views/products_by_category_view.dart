import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
import '../../../../models/product.dart';
import '../widgets/info_product_widget.dart';

class ProductsByCategoryView extends StatelessWidget {
  final int categoryId;
  final String categoryName;
  final List<Product> products;

  const ProductsByCategoryView({
    super.key,
    required this.categoryId,
    required this.categoryName,
    required this.products,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8), // Fondo gris suave
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
                Text(
                  '${products.length} ${products.length == 1 ? 'producto' : 'productos'}',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
            actions: [
              // 🔍 Icono de búsqueda (opcional)
              IconButton(
                icon: const Icon(
                  Icons.search_rounded,
                  color: Color(0xFFD95D85),
                  size: 24,
                ),
                onPressed: () {
                  // TODO: Implementar búsqueda
                },
              ),
            ],
          ),
        ),
      ),
      body: products.isEmpty
          ? _buildEmptyState()
          : Column(
              children: [
                // 📊 Header con filtros (opcional)
                _buildFilterHeader(),

                // 📱 Grid de productos
                Expanded(
                  child: InfoProduct(products: products),
                ),
              ],
            ),
    );
  }

  /// Estado vacío cuando no hay productos
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFFFEEF3),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              size: 64,
              color: Color(0xFFD95D85),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'products.empty_title'.tr(),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'products.empty_subtitle'.tr(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  /// Header con filtros y ordenamiento
  Widget _buildFilterHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // 🔽 Botón de filtros
          Expanded(
            child: _filterButton(
              icon: Icons.tune_rounded,
              label: 'products.filters'.tr(),
              onTap: () {
                // TODO: Abrir panel de filtros
              },
            ),
          ),
          const SizedBox(width: 12),

          // 📊 Botón de ordenar
          Expanded(
            child: _filterButton(
              icon: Icons.swap_vert_rounded,
              label: 'products.sort'.tr(),
              onTap: () {
                // TODO: Abrir opciones de ordenamiento
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Botón de filtro reutilizable
  Widget _filterButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: const Color(0xFFD95D85),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
