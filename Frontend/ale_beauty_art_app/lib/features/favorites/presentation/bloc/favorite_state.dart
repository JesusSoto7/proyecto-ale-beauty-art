part of 'favorite_bloc.dart';

@immutable
sealed class FavoriteState {}

final class FavoriteInitial extends FavoriteState {}

final class FavoriteLoading extends FavoriteState {}

final class FavoriteSuccess extends FavoriteState {
  final List<FavoriteProduct> favorites;

  FavoriteSuccess(this.favorites);
}

final class FavoriteError extends FavoriteState {
  final String message;

  FavoriteError(this.message);
}

final class FavoriteActionLoaded extends FavoriteState {}

final class FavoriteActionFailure extends FavoriteState {
  final String message;
  FavoriteActionFailure(this.message);
}
