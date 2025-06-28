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
    on<ProductFetched>((event, emit) async {
      emit(ProductLoadInProgress());

      try {
        // CAMBIA localhost o 127.0.0.1 por la IP real de tu PC (ej: 192.168.1.100)
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/products');

        final response = await CustomHttpClient.client.get(url);

        if (response.statusCode == 200) {
          final List<dynamic> jsonList = jsonDecode(response.body);
          final List<Product> products = jsonList.map((e) => Product.fromJson(e)).toList();

          emit(ProductLoadSuccess(products));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (e) {
        print("Error al obtener productos: $e"); // te ayudará a depurar
        emit(ProductLoadFailure());
      }
    });
  }
}
