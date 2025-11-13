import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../models/product.dart';
import 'dart:convert';
import '../../../../core/http/custom_http_client.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
part 'product_event.dart';
part 'product_state.dart';

class ProductBloc extends Bloc<ProductsEvent, ProductState> {
  ProductFilter _currentFilter = const ProductFilter();
  ProductSort _currentSort = ProductSort.none;
  List<Product> _allProducts = [];

  // Getter público para acceder al catálogo completo desde la UI (p.ej. construir listas de categorías)
  List<Product> get allProducts => _allProducts;

  ProductBloc() : super(ProductInitial()) {
    // Handler para lista de productos
    on<ProductFetched>((event, emit) async {
      emit(ProductLoadInProgress());
      try {
        final url = Uri.parse('${dotenv.env['API_BASE_URL']}/api/v1/products');
        final client = await CustomHttpClient.client;
        final response = await client.get(url);

        if (response.statusCode == 200) {
          final List<dynamic> jsonList = jsonDecode(response.body);
          _allProducts = jsonList.map((e) => Product.fromJson(e)).toList();
          final filtered = _applyFilterAndSort();
          emit(ProductLoadSuccess(filtered, filter: _currentFilter, sort: _currentSort));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (e) {
        print("Error al obtener productos: $e");
        emit(ProductLoadFailure());
      }
    });

    // Handler para detalle de producto
    on<ProductDetailRequested>(
        (ProductDetailRequested event, Emitter<ProductState> emit) async {
      emit(ProductLoadInProgress());
      try {
        final url = Uri.parse(
            '${dotenv.env['API_BASE_URL']}/api/v1/products/${event.productId}');
        final client = await CustomHttpClient.client;
        final response = await client.get(url);

        if (response.statusCode == 200) {
          final Map<String, dynamic> json = jsonDecode(response.body);
          final product = Product.fromJson(json); // single detail
          emit(ProductLoadSuccess([product], filter: _currentFilter, sort: _currentSort));
        } else {
          emit(ProductLoadFailure());
        }
      } catch (e) {
        print("Error al obtener detalle producto: $e");
        emit(ProductLoadFailure());
      }
    });

    on<ProductFilterChanged>((event, emit) {
      _currentFilter = event.filter;
      final filtered = _applyFilterAndSort();
  emit(ProductLoadSuccess(filtered, filter: _currentFilter, sort: _currentSort));
    });

    on<ProductSortChanged>((event, emit) {
      _currentSort = event.sort;
      final filtered = _applyFilterAndSort();
  emit(ProductLoadSuccess(filtered, filter: _currentFilter, sort: _currentSort));
    });
  }

  List<Product> _applyFilterAndSort() {
    Iterable<Product> working = _allProducts;

    // Filtros
    if (_currentFilter.onlyDiscounted) {
      working = working.where((p) => p.tieneDescuento);
    }
    if (_currentFilter.onlyInStock) {
      working = working.where((p) => p.stock > 0);
    }
    if (_currentFilter.categoryId != null) {
      working = working.where((p) => p.categoryId == _currentFilter.categoryId);
    }
    if (_currentFilter.subCategoryId != null) {
      working = working.where((p) => p.subCategoryId == _currentFilter.subCategoryId);
    }
    if (_currentFilter.searchQuery != null && _currentFilter.searchQuery!.isNotEmpty) {
      final q = _currentFilter.searchQuery!.toLowerCase();
  working = working.where((p) {
    return p.nombreProducto.toLowerCase().contains(q) ||
    p.descripcion.toLowerCase().contains(q) ||
    p.nombreCategoria.toLowerCase().contains(q) ||
    p.nombreSubCategoria.toLowerCase().contains(q);
  });
    }
    if (_currentFilter.minPrice != null) {
      working = working.where((p) => p.precioConMejorDescuentoOrBase >= _currentFilter.minPrice!);
    }
    if (_currentFilter.maxPrice != null) {
      working = working.where((p) => p.precioConMejorDescuentoOrBase <= _currentFilter.maxPrice!);
    }

    final list = working.toList();

    // Ordenamiento
    switch (_currentSort) {
      case ProductSort.priceAsc:
        list.sort((a, b) => a.precioConMejorDescuentoOrBase.compareTo(b.precioConMejorDescuentoOrBase));
        break;
      case ProductSort.priceDesc:
        list.sort((a, b) => b.precioConMejorDescuentoOrBase.compareTo(a.precioConMejorDescuentoOrBase));
        break;
      case ProductSort.discountDesc:
        int discountValue(Product p) {
          final base = p.precioProducto.toDouble();
          final pay = p.precioConMejorDescuentoOrBase;
          if (base <= 0) return 0;
            return (((base - pay) / base) * 100).round();
        }
        list.sort((a, b) => discountValue(b).compareTo(discountValue(a)));
        break;
      case ProductSort.none:
        break;
    }
    return list;
  }
}

enum ProductSort { none, priceAsc, priceDesc, discountDesc }

class ProductFilter extends Equatable {
  final int? categoryId;
  final int? subCategoryId;
  final bool onlyDiscounted;
  final bool onlyInStock;
  final double? minPrice;
  final double? maxPrice;
  final String? searchQuery;
  static const Object _unset = Object();

  const ProductFilter({
    this.categoryId,
    this.subCategoryId,
    this.onlyDiscounted = false,
    this.onlyInStock = false,
    this.minPrice,
    this.maxPrice,
    this.searchQuery,
  });

  ProductFilter copyWith({
    Object? categoryId = _unset,
    Object? subCategoryId = _unset,
    bool? onlyDiscounted,
    bool? onlyInStock,
    Object? minPrice = _unset,
    Object? maxPrice = _unset,
    Object? searchQuery = _unset,
  }) {
    return ProductFilter(
      categoryId: identical(categoryId, _unset) ? this.categoryId : categoryId as int?,
      subCategoryId: identical(subCategoryId, _unset) ? this.subCategoryId : subCategoryId as int?,
      onlyDiscounted: onlyDiscounted ?? this.onlyDiscounted,
      onlyInStock: onlyInStock ?? this.onlyInStock,
      minPrice: identical(minPrice, _unset) ? this.minPrice : minPrice as double?,
      maxPrice: identical(maxPrice, _unset) ? this.maxPrice : maxPrice as double?,
      searchQuery: identical(searchQuery, _unset) ? this.searchQuery : searchQuery as String?,
    );
  }

  @override
  List<Object?> get props => [
        categoryId,
        subCategoryId,
        onlyDiscounted,
        onlyInStock,
        minPrice,
        maxPrice,
        searchQuery,
      ];
}

extension _PriceHelper on Product {
  double get precioConMejorDescuentoOrBase =>
      (precioConMejorDescuento ?? precioProducto).toDouble();
}
