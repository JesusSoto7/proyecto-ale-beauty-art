part of 'products_bloc.dart';

sealed class ProductsState extends Equatable {
  const ProductsState();
  
  @override
  List<Object> get props => [];
}

class ProductInitial extends ProductsState {}

class ProductLoadInProgress extends ProductsState {}

class ProductLoadSuccess extends ProductsState {
  final List<Product> products;

  const ProductLoadSuccess(this.products);

  @override
  List<Object> get props => [products];
}

class ProductLoadFailure extends ProductsState {}
