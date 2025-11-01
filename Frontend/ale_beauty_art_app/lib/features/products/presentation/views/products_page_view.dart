import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
// import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsPageView extends StatelessWidget {
  final String? searchQuery;
  const ProductsPageView({super.key, this.searchQuery});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('nav.products'.tr()),
          centerTitle: true,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0,
        ),
        body: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          if (state is ProductInitial) {
            // Ensure products are loaded when entering via search
            context.read<ProductBloc>().add(ProductFetched());
            return const LoadingView();
          }
          if (state is ProductLoadInProgress) {
            return LoadingView(); 
          } else if (state is ProductLoadSuccess) {
            final q = (searchQuery ?? '').trim().toLowerCase();
            final List products = q.isEmpty
                ? state.products
                : state.products.where((p) {
                    final name = p.nombreProducto.toLowerCase();
                    final desc = (p.descripcion).toLowerCase();
                    final cat = p.nombreCategoria.toLowerCase();
                    final sub = p.nombreSubCategoria.toLowerCase();
                    return name.contains(q) ||
                        desc.contains(q) ||
                        cat.contains(q) ||
                        sub.contains(q);
                  }).toList();

            if (products.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'products.empty_title'.tr(),
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.w600),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'products.empty_subtitle'.tr(),
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              );
            }
            return ProductsListView(products: List.from(products));
          } else if (state is ProductLoadFailure) {
            return FailureView(); 
          } else {
            return FailureView(); // evita errores
          }
        },
      )
    ); 
  }
}
