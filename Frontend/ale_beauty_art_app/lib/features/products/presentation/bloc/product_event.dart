part of 'product_bloc.dart';

sealed class ProductsEvent extends Equatable {
  const ProductsEvent();

  @override
  List<Object> get props => [];
}

class ProductFetched extends ProductsEvent {}

class ProductFilterChanged extends ProductsEvent {
  final ProductFilter filter;
  const ProductFilterChanged(this.filter);
  @override
  List<Object> get props => [filter];
}

class ProductSortChanged extends ProductsEvent {
  final ProductSort sort;
  const ProductSortChanged(this.sort);
  @override
  List<Object> get props => [sort];
}

class ProductDetailRequested extends ProductsEvent {
  final int productId;
  const ProductDetailRequested(this.productId);

  @override
  List<Object> get props => [productId];
}
