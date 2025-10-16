import 'dart:convert';
import 'package:ale_beauty_art_app/models/favorite.dart';
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';
import 'package:http/http.dart' as http;

part 'favorite_event.dart';
part 'favorite_state.dart';

class FavoriteBloc extends Bloc<FavoriteEvent, FavoriteState> {
  final String apiUrl;
  String _jwtToken;

  FavoriteBloc({required this.apiUrl, required String jwtToken})
      : _jwtToken = jwtToken,
        super(FavoriteInitial()) {
    on<UpdateFavoriteToken>((event, emit) {
      _jwtToken = event.token;
    });
    on<LoadFavorites>(_onLoadFavorites);
    on<AddFavorite>(_onAddFavorite);
    on<RemoveFavorite>(_onRemoveFavorite);
    on<ClearFavorites>((event, emit) async {
      if (state is FavoriteSuccess) {
        final favorites = (state as FavoriteSuccess).favorites;
        for (var fav in favorites) {
          await http.delete(
            Uri.parse('$apiUrl/favorites/${fav.id}'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_jwtToken',
            },
          );
        }
        add(LoadFavorites());
      }
    });
    on<AddAllFavoritesToCart>((event, emit) async {
      if (state is FavoriteSuccess) {
        final favorites = (state as FavoriteSuccess).favorites;
        for (var fav in favorites) {
          await http.post(
            Uri.parse('$apiUrl/cart/add_product'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_jwtToken',
            },
            body: jsonEncode({'product_id': fav.id}),
          );
        }
      }
    });
  }

  Future<void> _onLoadFavorites(
      LoadFavorites event, Emitter<FavoriteState> emit) async {
    emit(FavoriteLoading());
    try {
      final response = await http.get(
        Uri.parse('$apiUrl/favorites'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        final favorites = data.map((e) => FavoriteProduct.fromJson(e)).toList();
        emit(FavoriteSuccess(favorites));
      } else {
        emit(FavoriteError('Error al cargar favoritos'));
      }
    } catch (e) {
      emit(FavoriteError(e.toString()));
    }
  }

  Future<void> _onAddFavorite(
      AddFavorite event, Emitter<FavoriteState> emit) async {
    try {
      await http.post(
        Uri.parse('$apiUrl/favorites'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
        body: jsonEncode({'product_id': event.productId}),
      );
      add(LoadFavorites());
    } catch (e) {
      emit(FavoriteError('No se pudo agregar a favoritos'));
    }
  }

  Future<void> _onRemoveFavorite(
      RemoveFavorite event, Emitter<FavoriteState> emit) async {
    try {
      await http.delete(
        Uri.parse('$apiUrl/favorites/${event.productId}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_jwtToken',
        },
      );
      add(LoadFavorites());
    } catch (e) {
      emit(FavoriteError('No se pudo eliminar de favoritos'));
    }
  }
}
