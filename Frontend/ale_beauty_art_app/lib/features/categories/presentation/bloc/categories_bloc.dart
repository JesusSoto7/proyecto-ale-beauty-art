import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../models/category.dart';
import '../../../../core/http/custom_http_client.dart';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';

part 'categories_event.dart';
part 'categories_state.dart';

class CategoriesBloc extends Bloc<CategoriesEvent, CategoriesState> {
  CategoriesBloc() : super(CategoriesInitial()) {
    on<CategoriesFetched>((event, emit) async {
      emit(CategoriesLoadInProgress());

      try {
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/categories');
        final client = await CustomHttpClient.client;
        final response = await client.get(url);

        if (response.statusCode == 200) {
          final List<dynamic> jsonList = jsonDecode(response.body);
          final List<Category> categories = jsonList.map((e) => Category.fromJson(e)).toList();
          emit(CategoriesLoadSuccess(categories));
        } else {
          emit(CategoriesLoadFailure());
        }
      } catch (e) {
        print('Error al obtener categorías: $e');
        emit(CategoriesLoadFailure());
      }
    });
  }
}


