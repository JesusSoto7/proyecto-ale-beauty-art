part of 'favorite_bloc.dart';

@immutable
sealed class FavoriteEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadFavorites extends FavoriteEvent {}

class AddFavorite extends FavoriteEvent {
  final int productId;
  AddFavorite(this.productId);
  @override
  List<Object?> get props => [productId];
}

class RemoveFavorite extends FavoriteEvent {
  final int productId;
  RemoveFavorite(this.productId);
  @override
  List<Object?> get props => [productId];
}

class ClearFavorites extends FavoriteEvent {}

class AddAllFavoritesToCart extends FavoriteEvent {}
