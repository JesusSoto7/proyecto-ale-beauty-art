import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/models/product.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

part 'product_event.dart';
part 'product_state.dart';



class ProductBloc extends Bloc<ProductsEvent, ProductState> {
  ProductBloc() : super(ProductInitial()) {
    on<ProductFetched>((event, emit) async {
      emit(ProductLoadInProgress());

      try {
        final url = Uri.parse('https://run.mocky.io/v3/ce9ab7d2-a750-45d9-85be-bd37ea59dbfc');
        final response = await http.get(url);

        if (response.statusCode == 200) {
          final List<dynamic> jsonList = jsonDecode(response.body);
          final List<Product> products = jsonList.map((e) => Product.fromJson(e)).toList();

          emit(ProductLoadSuccess(products));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (_) {
        emit(ProductLoadFailure());
      }
    });
  }
}
