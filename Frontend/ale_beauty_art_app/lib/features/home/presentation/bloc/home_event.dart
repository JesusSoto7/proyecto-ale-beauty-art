part of 'home_bloc.dart';

sealed class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object> get props => [];
}

final class HomeShowProductsPressed extends HomeEvent{}

final class HomeVolverPressed extends HomeEvent {}
