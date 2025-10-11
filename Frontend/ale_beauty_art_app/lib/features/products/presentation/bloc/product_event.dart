part of 'product_bloc.dart';

sealed class ProductsEvent extends Equatable {
  const ProductsEvent();

  @override
  List<Object> get props => [];
}

class ProductFetched extends ProductsEvent {}

class ProductDetailRequested extends ProductsEvent {
  final int productId;
  const ProductDetailRequested(this.productId);

  @override
  List<Object> get props => [productId];
}
