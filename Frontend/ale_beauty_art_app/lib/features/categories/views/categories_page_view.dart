import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../products/presentation/bloc/product_bloc.dart';
import '../../products/presentation/views/products_by_category_view.dart';
import '../bloc/categories_bloc.dart';

class CategoriesPageView extends StatelessWidget {
  const CategoriesPageView({super.key});

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(

      body: BlocBuilder<CategoriesBloc, CategoriesState>(
        builder: (context, state) {
          if (state is CategoriesLoadInProgress) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is CategoriesLoadSuccess) {
            return ListView.builder(
              itemCount: state.categories.length,
              itemBuilder: (context, index) {
                final category = state.categories[index];
                return ListTile(
                  leading:  ClipOval(
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
                );
              },
            );
          } else {
            return const Center(child: Text("Error al cargar categorías"));
          }
        },
      ),
    );
  }
}

