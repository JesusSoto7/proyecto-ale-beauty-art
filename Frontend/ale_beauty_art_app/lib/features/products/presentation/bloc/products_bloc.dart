import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/products.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

part 'products_event.dart';
part 'products_state.dart';



class ProductBloc extends Bloc<ProductsEvent, ProductsState> {
  ProductBloc() : super(ProductInitial()) {
    on<ProductFetched>((event, emit) async {
      emit(ProductLoadInProgress());

      try {
        final url = Uri.parse('https://run.mocky.io/v3/a25241ce-0c33-4bb9-9cc5-2d9574e9fd0e');
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
