import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/info_product_widget.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:flutter/material.dart';
import '../../domain/models/product.dart';

class ProductsListView extends StatelessWidget {
  final List<Product> products;

  const ProductsListView({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => BlocProvider(
                      create: (_) => ProductBloc()..add(ProductVolverPressed()),
                      child: InitialView(),
                    ),
                  ),
                );
              },
            child: const Text('Volver al inicio'),
          ),
          Expanded(child:InfoProduct(products: products),
            
          ),
        ],
      ),
    );
  }
}