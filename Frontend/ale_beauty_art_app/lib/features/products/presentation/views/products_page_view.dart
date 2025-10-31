import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
// import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsPageView extends StatelessWidget {
  const ProductsPageView({super.key});

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
          if (state is ProductLoadInProgress) {
            return LoadingView(); 
          } else if (state is ProductLoadSuccess) {
            return ProductsListView(products: state.products);
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
