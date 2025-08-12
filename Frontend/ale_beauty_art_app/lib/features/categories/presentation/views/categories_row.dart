import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../styles/colors.dart';
import '../bloc/categories_bloc.dart';
import '../../../products/presentation/bloc/product_bloc.dart';
import '../../../products/presentation/views/products_by_category_view.dart';

class CategoriesRowView extends StatefulWidget {
  const CategoriesRowView({super.key});

  @override
  State<CategoriesRowView> createState() => _CategoriesRowViewState();
}

class _CategoriesRowViewState extends State<CategoriesRowView> {
  int? selectedCategoryId;

  @override
  void initState() {
    super.initState();

    // Disparar carga si no está hecha
    final bloc = context.read<CategoriesBloc>();
    if (bloc.state is! CategoriesLoadSuccess) {
      bloc.add(CategoriesFetched());
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CategoriesBloc, CategoriesState>(
      builder: (context, state) {
        if (state is CategoriesLoadInProgress) {
          return const Center(child: CircularProgressIndicator(color: AppColors.accentPink));
        } else if (state is CategoriesLoadSuccess) {
          final categories = state.categories;

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal, // permite mover de derecha a izquierda
            child: Row(
              children: categories.map((category) {
                final isSelected = selectedCategoryId == category.id;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        selectedCategoryId = category.id;
                      });

                      final allProductsState = context.read<ProductBloc>().state;

                      if (allProductsState is ProductLoadSuccess) {
                        final filtered = allProductsState.products
                            .where((p) => p.categoryId == category.id)
                            .toList();

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
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Productos no disponibles todavía'),
                          ),
                        );
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? Colors.pink.shade50 : Colors.white,
                        border: Border.all(
                          color: isSelected ? AppColors.primaryPink : Colors.grey.shade300,
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: Colors.grey.shade100,
                            backgroundImage: category.imagen.isNotEmpty
                                ? NetworkImage(category.imagen)
                                : null,
                            child: category.imagen.isEmpty
                                ? const Icon(Icons.category, size: 16, color: Colors.grey)
                                : null,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            category.nombreCategoria,
                            style: TextStyle(
                              color: isSelected ? AppColors.primaryPink : Colors.grey.shade800,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          );
        } else {
          return const SizedBox.shrink();
        }
      },
    );
  }
}
