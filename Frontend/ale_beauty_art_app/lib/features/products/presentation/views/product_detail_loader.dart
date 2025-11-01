import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';

import '../bloc/product_bloc.dart';
import '../../../../models/product.dart';
import 'products_Detail_View.dart';

class ProductDetailLoader extends StatelessWidget {
  final int productId;
  const ProductDetailLoader({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProductBloc()..add(ProductDetailRequested(productId)),
      child: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          if (state is ProductLoadInProgress || state is ProductInitial) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (state is ProductLoadFailure) {
            return Scaffold(
              appBar: AppBar(
                title: Text('common.error'.tr()),
              ),
              body: Center(
                child: Text('orders.detail.product_detail_missing'.tr()),
              ),
            );
          }
          if (state is ProductLoadSuccess && state.products.isNotEmpty) {
            final Product product = state.products.first;
            return ProductDetailView(product: product);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
