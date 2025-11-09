part of 'product_bloc.dart';

sealed class ProductState extends Equatable {
  const ProductState();

  @override
  List<Object> get props => [];
}

class ProductInitial extends ProductState {}

class ProductLoadInProgress extends ProductState {}

class ProductLoadSuccess extends ProductState {
  final List<Product> products;
  final ProductFilter filter;
  final ProductSort sort;

  const ProductLoadSuccess(this.products, {this.filter = const ProductFilter(), this.sort = ProductSort.none});

  @override
  List<Object> get props => [products, filter, sort];
}

class ProductLoadFailure extends ProductState {}
