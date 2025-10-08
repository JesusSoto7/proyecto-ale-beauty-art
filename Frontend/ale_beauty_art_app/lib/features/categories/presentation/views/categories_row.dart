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
          return const Center(
            child: CircularProgressIndicator(color: AppColors.accentPink),
          );
        } else if (state is CategoriesLoadSuccess) {
          final categories = state.categories;

          return SizedBox(
            height: 140, // 🔼 antes 105
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              itemBuilder: (context, index) {
                final category = categories[index];
                final isSelected = selectedCategoryId == category.id;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      selectedCategoryId = category.id;
                    });

                    final productState = context.read<ProductBloc>().state;
                    if (productState is ProductLoadSuccess) {
                      final filtered = productState.products
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
                    width: 90, // 🔼 antes 80
                    margin: const EdgeInsets.symmetric(horizontal: 10),
                    child: Column(
                      children: [
                        Container(
                          height: 75, // 🔼 antes 60
                          width: 75,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isSelected
                                ? const Color(0xFFFFD9E3)
                                : Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.pink.withOpacity(0.1),
                                blurRadius: 8, // 🔼 más suave
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding:
                                const EdgeInsets.all(10.0), // 🔽 menos padding
                            child: category.imagen.isNotEmpty
                                ? Image.network(
                                    category.imagen,
                                    fit: BoxFit.contain,
                                  )
                                : const Icon(
                                    Icons.category_rounded,
                                    color: Color(0xFFD95D85),
                                    size: 34, // 🔼 antes 28
                                  ),
                          ),
                        ),
                        const SizedBox(height: 8), // 🔼 antes 6
                        Text(
                          category.nombreCategoria,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14, // 🔼 antes 12
                            color: isSelected
                                ? const Color(0xFFD95D85)
                                : Colors.black87,
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        } else {
          return const SizedBox.shrink();
        }
      },
    );
  }
}
