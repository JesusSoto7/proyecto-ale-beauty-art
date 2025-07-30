import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../products/presentation/bloc/product_bloc.dart';
import '../../../products/presentation/views/products_by_category_view.dart';
import '../bloc/categories_bloc.dart';
import '../../../../styles/colors.dart';

class CategoriesPageView extends StatelessWidget {
  const CategoriesPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: AppColors.background,
      body: BlocBuilder<CategoriesBloc, CategoriesState>(
        builder: (context, state) {
          if (state is CategoriesLoadInProgress) {
            return const Center(child: LoadingView());
          } else if (state is CategoriesLoadSuccess) {
            final categories = state.categories;
          
            return Padding(
              padding: const EdgeInsets.all(12.0), // Menos padding general
              child: GridView.builder(
                padding: const EdgeInsets.only(top: 40),
                itemCount: categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 2 círculos por fila
                  mainAxisSpacing: 20, // Menos espacio vertical
                  crossAxisSpacing: 12, // Menos espacio horizontal
                  childAspectRatio: 1, // Más ajustado
                ),
                itemBuilder: (context, index) {
                  final category = categories[index];

                  return GestureDetector(
                    onTap: () {
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
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Imagen circular
                        CircleAvatar(
                          radius: 60, // tamaño 
                          backgroundColor: Colors.pink.shade50,
                          backgroundImage: category.imagen.isNotEmpty
                              ? NetworkImage(category.imagen)
                              : null, // Si no hay imagen, se usa el emoji
                          child: category.imagen.isEmpty
                              ? const Center(
                                  child: Text(
                                    '💄', // Emoji por defecto
                                    style: TextStyle(
                                      fontSize: 34,
                                      color: AppColors.primaryPink,
                                    ),
                                  ),
                                )
                              : null, // No se muestra el emoji si hay imagen
                        ),
                        const SizedBox(height: 8),
                        // Nombre de la categoría
                        Text(
                          category.nombreCategoria,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF374151),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          } else if(state is CategoriesLoadFailure){
            return FailureView();
          } else {
            return FailureView();
          }
        },
      ),
    );
  }
}
