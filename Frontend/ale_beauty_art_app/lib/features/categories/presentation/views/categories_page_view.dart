import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../products/presentation/bloc/product_bloc.dart';
import '../../../products/presentation/views/products_by_category_view.dart';
import 'subcategories_view.dart';
import '../bloc/categories_bloc.dart';
import '../../../../styles/colors.dart';

class CategoriesPageView extends StatelessWidget {
  const CategoriesPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      body: BlocBuilder<CategoriesBloc, CategoriesState>(
        builder: (context, state) {
          if (state is CategoriesLoadInProgress) {
            return const Center(child: LoadingView());
          } else if (state is CategoriesLoadSuccess) {
            final categories = state.categories;

            return Padding(
              padding: const EdgeInsets.all(12.0), // Menos padding general
              child: GridView.builder(
                padding: EdgeInsets.zero,
                itemCount: categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 2 círculos por fila
                  mainAxisSpacing: 20, // Menos espacio vertical
                  crossAxisSpacing: 12, // Menos espacio horizontal
                  childAspectRatio: 1, // Más ajustado
                ),
                itemBuilder: (context, index) {
                  final category = categories[index];

                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        final allProductsState = context.read<ProductBloc>().state;
                        if (allProductsState is ProductLoadSuccess) {
                          final filteredTap = allProductsState.products
                              .where((p) => p.categoryId == category.id)
                              .toList();
                          final hasSubcatsTap =
                              filteredTap.any((p) => p.subCategoryId != 0);
                          if (hasSubcatsTap) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => SubCategoriesView(
                                  categoryId: category.id,
                                  categoryName: category.nombreCategoria,
                                  allProductsInCategory: filteredTap,
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
                                  products: filteredTap,
                                ),
                              ),
                            );
                          }
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Productos no disponibles todavía'),
                            ),
                          );
                        }
                      },
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
                        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Imagen con aro y fondo suave
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.pink.shade50,
                                    Colors.pink.shade50.withValues(alpha: 0.6),
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                              ),
                              child: Center(
                                child: CircleAvatar(
                                  radius: 52,
                                  backgroundColor: Colors.white,
                                  backgroundImage: category.imagen.isNotEmpty
                                      ? NetworkImage(category.imagen)
                                      : null,
                                  child: category.imagen.isEmpty
                                      ? const Text('💄', style: TextStyle(fontSize: 34, color: AppColors.primaryPink))
                                      : null,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            // Nombre
                            Text(
                              category.nombreCategoria,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF374151),
                              ),
                            ),
                            const SizedBox(height: 6),
                            // (Conteo oculto por solicitud)
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          } else if (state is CategoriesLoadFailure) {
            return FailureView();
          } else {
            return FailureView();
          }
        },
      ),
    );
  }
}
