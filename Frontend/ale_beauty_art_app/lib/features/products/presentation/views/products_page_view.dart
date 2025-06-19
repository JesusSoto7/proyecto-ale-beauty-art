import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsPageView extends StatelessWidget {
  const ProductsPageView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      // appBar: AppBar(
        // automaticallyImplyLeading: false,
        // leading: GestureDetector(
        //   onTap: () {
        //     Navigator.pop(context); // Regresa a la vista anterior (Inicio)
        //   },
        //   child: Padding(
        //     padding: const EdgeInsets.all(8.0),
        //     child: Image.asset(
        //       'assets/images/ale_logo.jpg', // Ruta a tu logo
        //       fit: BoxFit.contain,
        //     ),
        //   ),
        // ),
      //   title: const Text(
      //   'Productos',
      //   style: AppTextStyles.appBarTitle,
      //   ),
      //   centerTitle: true, 
      //   backgroundColor: AppColors.primaryPink,
      //   elevation: 4,
      // ),

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
