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

  const ProductLoadSuccess(this.products);

  @override
  List<Object> get props => [products];
}
class ProductLoadFailure extends ProductState {}

