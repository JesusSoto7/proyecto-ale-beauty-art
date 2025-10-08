import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../models/product.dart';
import 'dart:convert';
import '../../../../core/http/custom_http_client.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
part 'product_event.dart';
part 'product_state.dart';

class ProductBloc extends Bloc<ProductsEvent, ProductState> {
  ProductBloc() : super(ProductInitial()) {
    // Handler para lista de productos
    on<ProductFetched>((event, emit) async {
      emit(ProductLoadInProgress());
      try {
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/products');
        final client = await CustomHttpClient.client;
        final response = await client.get(url);

        if (response.statusCode == 200) {
          final List<dynamic> jsonList = jsonDecode(response.body);
          final List<Product> products =
              jsonList.map((e) => Product.fromJson(e)).toList();
          emit(ProductLoadSuccess(products));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (e) {
        print("Error al obtener productos: $e");
        emit(ProductLoadFailure());
      }
    });

    // Handler para detalle de producto
    on<ProductDetailRequested>(
        (ProductDetailRequested event, Emitter<ProductState> emit) async {
      emit(ProductLoadInProgress());
      try {
        final url = Uri.parse(
            '${dotenv.env['API_BASE_URL']}/api/v1/products/${event.productId}');
        final client = await CustomHttpClient.client;
        final response = await client.get(url);

        if (response.statusCode == 200) {
          final Map<String, dynamic> json = jsonDecode(response.body);
          final product = Product.fromJson(json);
          emit(ProductLoadSuccess([product]));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (e) {
        print("Error al obtener detalle producto: $e");
        emit(ProductLoadFailure());
      }
    });
  }
}
