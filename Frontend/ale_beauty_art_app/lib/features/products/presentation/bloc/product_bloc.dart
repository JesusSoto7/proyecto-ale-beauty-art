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
        final url = Uri.parse('https://raw.githubusercontent.com/JesusSoto7/Sotomayor/main/db.json');
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
