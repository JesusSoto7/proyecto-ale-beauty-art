import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_list_view.dart';
// import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// Simple internal structure for category grouping
class _CategoryGroup {
  final int id;
  final String name;
  final Map<int, String> subCategories; // subId -> subName
  _CategoryGroup({required this.id, required this.name, required this.subCategories});
}

class ProductsPageView extends StatefulWidget {
  final String? searchQuery;
  const ProductsPageView({super.key, this.searchQuery});

  @override
  State<ProductsPageView> createState() => _ProductsPageViewState();
}

class _ProductsPageViewState extends State<ProductsPageView> {
  bool _searchApplied = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('nav.products'.tr()),
          centerTitle: true,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0,
          actions: const [],
        ),
        body: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          if (state is ProductInitial) {
            // Ensure products are loaded when entering via search
            context.read<ProductBloc>().add(ProductFetched());
            return const LoadingView();
          }
          if (state is ProductLoadInProgress) {
            return LoadingView(); 
          } else if (state is ProductLoadSuccess) {
            // Apply incoming search once into the bloc filter
            final incomingQ = (widget.searchQuery ?? '').trim();
            if (incomingQ.isNotEmpty && !_searchApplied && state.filter.searchQuery != incomingQ) {
              context.read<ProductBloc>().add(
                    ProductFilterChanged(state.filter.copyWith(searchQuery: incomingQ)),
                  );
              _searchApplied = true;
            }
            final products = state.products;
            return Column(
              children: [
                _buildFilterHeader(context, state),
                if (!_shouldHideChips(state.filter)) _ActiveFiltersBar(
                  filter: state.filter,
                  products: context.read<ProductBloc>().allProducts,
                  onClear: (token) => _clearToken(token),
                ),
                Expanded(
                  child: products.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'products.empty_title'.tr(),
                                  style: const TextStyle(
                                      fontSize: 18, fontWeight: FontWeight.w600),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'products.empty_subtitle'.tr(),
                                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ProductsListView(products: List.from(products)),
                ),
              ],
            );
          } else if (state is ProductLoadFailure) {
            return FailureView(); 
          } else {
            return FailureView(); // evita errores
          }
        },
      )
    ); 
  }

  void _openFilters(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final bloc = context.read<ProductBloc>();
        final state = bloc.state;
        ProductFilter current = const ProductFilter();
        // SIEMPRE usar el catálogo completo para construir categorías/subcategorías
        List products = bloc.allProducts;
        if (state is ProductLoadSuccess) {
          current = state.filter;
        }

        // Manual price inputs persistent (do not auto-clamp to product bounds)
        bool onlyDiscounted = current.onlyDiscounted;
        double startVal = current.minPrice ?? 0;
        double endVal = current.maxPrice ?? 0;
        // If user inverted values previously, normalize but keep their intention
        if (startVal > endVal && endVal != 0) {
          final tmp = startVal; startVal = endVal; endVal = tmp;
        }

        // Build category-subcategory structure
        final Map<int, _CategoryGroup> categoryGroups = {};
        for (var p in products) {
          final catId = p.categoryId as int;
          final subId = p.subCategoryId as int;
          categoryGroups.putIfAbsent(catId, () => _CategoryGroup(id: catId, name: p.nombreCategoria, subCategories: {}));
          categoryGroups[catId]!.subCategories.putIfAbsent(subId, () => p.nombreSubCategoria);
        }
        final sortedCats = categoryGroups.values.toList()..sort((a,b)=>a.name.toLowerCase().compareTo(b.name.toLowerCase()));
        int? selectedCategoryId = current.categoryId;
        int? selectedSubCategoryId = current.subCategoryId;

        return StatefulBuilder(builder: (context, setModalState) {
          final theme = Theme.of(context);
          final checkboxTheme = theme.checkboxTheme.copyWith(
            shape: const CircleBorder(),
            fillColor: MaterialStateProperty.resolveWith((states) {
              if (states.contains(MaterialState.selected)) {
                return const Color(0xFFD95D85);
              }
              return Colors.white;
            }),
            checkColor: const MaterialStatePropertyAll(Colors.white),
            side: MaterialStateBorderSide.resolveWith(
              (states) => const BorderSide(color: Color(0xFFD95D85)),
            ),
          );
          return Theme(
            data: theme.copyWith(checkboxTheme: checkboxTheme),
            child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              Text('products.filters'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              if (sortedCats.isNotEmpty) ...[
                Text('products.filter_panel.categories_title'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                CheckboxListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text('products.filter_panel.show_all'.tr()),
                  value: selectedCategoryId == null,
                  onChanged: (v) {
                    if (v == true) {
                      setModalState(() {
                        selectedCategoryId = null;
                        selectedSubCategoryId = null;
                      });
                    }
                  },
                  controlAffinity: ListTileControlAffinity.leading,
                ),
                ...sortedCats.map((cat) {
                  final isSelectedCat = selectedCategoryId == cat.id;
                  return CheckboxListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text(cat.name),
                    value: isSelectedCat,
                    onChanged: (v) {
                      setModalState(() {
                        if (v == true) {
                          selectedCategoryId = cat.id;
                          selectedSubCategoryId = null;
                        } else {
                          selectedCategoryId = null;
                          selectedSubCategoryId = null;
                        }
                      });
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                  );
                }).toList(),
                const SizedBox(height: 8),
                if (selectedCategoryId != null) ...[
                  const Divider(height: 8),
                  Text('products.filter_panel.subcategories_title'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  CheckboxListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    title: Text('products.filter_panel.show_all'.tr()),
                    value: selectedSubCategoryId == null,
                    onChanged: (v) {
                      if (v == true) {
                        setModalState(() => selectedSubCategoryId = null);
                      }
                    },
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
                  ...categoryGroups[selectedCategoryId]!
                      .subCategories
                      .entries
                      .map((e) {
                    final subId = e.key;
                    final subName = e.value;
                    final isSelectedSub = selectedSubCategoryId == subId;
                    return CheckboxListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: Text(subName),
                      value: isSelectedSub,
                      onChanged: (v) {
                        setModalState(() {
                          if (v == true) {
                            selectedSubCategoryId = subId;
                          } else {
                            selectedSubCategoryId = null;
                          }
                        });
                      },
                      controlAffinity: ListTileControlAffinity.leading,
                    );
                  }).toList(),
                  const SizedBox(height: 8),
                ],
              ],

              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFFAFAFA),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFD95D85).withOpacity(0.25)),
                ),
                child: SwitchListTile(
                  dense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                  secondary: const Icon(Icons.local_offer, color: Color(0xFFD95D85)),
                  activeColor: const Color(0xFFD95D85),
                  title: Text('products.filter_panel.discount_only'.tr(),
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  value: onlyDiscounted,
                  onChanged: (v) => setModalState(() => onlyDiscounted = v),
                ),
              ),
              const SizedBox(height: 8),
              Text('products.filter_panel.price_title'.tr()),
              const SizedBox(height: 6),
              _PriceInputs(
                initialMin: current.minPrice,
                initialMax: current.maxPrice,
                onChanged: (min, max) {
                  setModalState(() {
                    // Persist user intent: empty -> 0 (means no limit when applied)
                    startVal = min ?? 0;
                    endVal = max ?? 0;
                  });
                },
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Parse manual price values
                    // Map 0 to null (no bound). If both 0, remove price filter.
                    double? finalMin = startVal.isFinite ? startVal : null;
                    double? finalMax = endVal.isFinite ? endVal : null;
                    if (finalMin == 0) finalMin = null;
                    if (finalMax == 0) finalMax = null;
                    if (finalMin != null && finalMax != null && finalMin > finalMax) {
                      final tmp = finalMin; finalMin = finalMax; finalMax = tmp;
                    }
                    final newFilter = current.copyWith(
                      onlyDiscounted: onlyDiscounted,
                      onlyInStock: false, // ensure stock filter is off
                      minPrice: finalMin,
                      maxPrice: finalMax,
                      categoryId: selectedCategoryId,
                      subCategoryId: selectedSubCategoryId,
                    );
                    context.read<ProductBloc>().add(ProductFilterChanged(newFilter));
                    Navigator.pop(ctx);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD95D85),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text('common.continue'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
          );
        });
      },
    );
  }

  void _openSort(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Text(
              'products.sort'.tr(),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            ),
            ListTile(
              leading: const Icon(Icons.arrow_upward, color: Color(0xFFD95D85)),
              title: Text('products.sort_options.price_asc'.tr()),
              onTap: () {
                context.read<ProductBloc>().add(const ProductSortChanged(ProductSort.priceAsc));
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.arrow_downward, color: Color(0xFFD95D85)),
              title: Text('products.sort_options.price_desc'.tr()),
              onTap: () {
                context.read<ProductBloc>().add(const ProductSortChanged(ProductSort.priceDesc));
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_offer, color: Color(0xFFD95D85)),
              title: Text('products.sort_options.discount_desc'.tr()),
              onTap: () {
                context.read<ProductBloc>().add(const ProductSortChanged(ProductSort.discountDesc));
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.clear, color: Color(0xFFD95D85)),
              title: Text('products.sort_options.clear'.tr()),
              onTap: () {
                context.read<ProductBloc>().add(const ProductSortChanged(ProductSort.none));
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 8),
          ],
        );
      },
    );
  }

  void _clearToken(String token) {
    // Clear individual filter tokens using the latest bloc state
    final st = context.read<ProductBloc>().state;
    if (st is! ProductLoadSuccess) return;
    final f = st.filter;
    if (token == 'search') {
      context.read<ProductBloc>().add(ProductFilterChanged(f.copyWith(searchQuery: null)));
    } else if (token == 'discount') {
      context.read<ProductBloc>().add(ProductFilterChanged(f.copyWith(onlyDiscounted: false)));
    } else if (token == 'price') {
      context.read<ProductBloc>().add(ProductFilterChanged(f.copyWith(minPrice: null, maxPrice: null)));
    } else if (token == 'category') {
      context.read<ProductBloc>().add(ProductFilterChanged(f.copyWith(categoryId: null, subCategoryId: null)));
    } else if (token == 'subcategory') {
      context.read<ProductBloc>().add(ProductFilterChanged(f.copyWith(subCategoryId: null)));
    }
  }

  bool _shouldHideChips(ProductFilter f) {
    // Hide chips if price filter collapsed to 0-0 (interpreted as no filter) AND no other filters active
    final hasPrice = (f.minPrice != null || f.maxPrice != null);
    final priceZeroZero = (f.minPrice == null || f.minPrice == 0) && (f.maxPrice == null || f.maxPrice == 0);
    final others = (f.searchQuery != null && f.searchQuery!.isNotEmpty) || f.onlyDiscounted || f.categoryId != null || f.subCategoryId != null;
    if (hasPrice && priceZeroZero && !others) {
      return true;
    }
    return false;
  }

  Widget _buildFilterHeader(BuildContext context, ProductLoadSuccess state) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(20, 0, 0, 0),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _headerButton(
              icon: Icons.tune_rounded,
              label: 'products.filters'.tr(),
              onTap: () => _openFilters(context),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _headerButton(
              icon: Icons.swap_vert_rounded,
              label: 'products.sort'.tr(),
              onTap: () => _openSort(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _headerButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey[300]!, width: 1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: const Color(0xFFD95D85)),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActiveFiltersBar extends StatelessWidget {
  final ProductFilter filter;
  final List products;
  final void Function(String token) onClear;
  const _ActiveFiltersBar({required this.filter, required this.onClear, required this.products});

  @override
  Widget build(BuildContext context) {
    final chips = <Widget>[];
    if ((filter.searchQuery ?? '').isNotEmpty) {
      chips.add(_FilterChip(label: '"${filter.searchQuery}"', onRemove: () => onClear('search')));
    }
    if (filter.onlyDiscounted) {
      chips.add(_FilterChip(label: 'Descuento', onRemove: () => onClear('discount')));
    }
    if (filter.minPrice != null || filter.maxPrice != null) {
      final mp = filter.minPrice?.toInt();
      final xp = filter.maxPrice?.toInt();
      chips.add(_FilterChip(label: 'Precio: ${mp ?? '-'} - ${xp ?? '-'}', onRemove: () => onClear('price')));
    }
    if (filter.categoryId != null) {
      String? catName;
      for (var p in products) {
        if (p.categoryId == filter.categoryId) { catName = p.nombreCategoria; break; }
      }
      chips.add(_FilterChip(label: 'Cat: ${catName ?? filter.categoryId}', onRemove: () => onClear('category')));
    }
    if (filter.subCategoryId != null) {
      String? subName;
      for (var p in products) {
        if (p.subCategoryId == filter.subCategoryId) { subName = p.nombreSubCategoria; break; }
      }
      chips.add(_FilterChip(label: 'Sub: ${subName ?? filter.subCategoryId}', onRemove: () => onClear('subcategory')));
    }
    if (chips.isEmpty) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(20, 0, 0, 0),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Wrap(spacing: 8, runSpacing: 6, children: chips),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final VoidCallback onRemove;
  const _FilterChip({required this.label, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD95D85).withOpacity(0.3),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
          InkWell(
            onTap: onRemove,
            borderRadius: BorderRadius.circular(20),
            child: const Padding(
              padding: EdgeInsets.all(2.0),
              child: Icon(Icons.close, size: 16, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceInputs extends StatefulWidget {
  final double? initialMin;
  final double? initialMax;
  final void Function(double? min, double? max) onChanged;
  const _PriceInputs({required this.initialMin, required this.initialMax, required this.onChanged});

  @override
  State<_PriceInputs> createState() => _PriceInputsState();
}

class _PriceInputsState extends State<_PriceInputs> {
  late TextEditingController _minCtrl;
  late TextEditingController _maxCtrl;

  @override
  void initState() {
    super.initState();
    _minCtrl = TextEditingController(text: widget.initialMin?.round().toString() ?? '');
    _maxCtrl = TextEditingController(text: widget.initialMax?.round().toString() ?? '');
  }

  @override
  void dispose() {
    _minCtrl.dispose();
    _maxCtrl.dispose();
    super.dispose();
  }

  void _emit() {
    double? min = double.tryParse(_minCtrl.text.trim());
    double? max = double.tryParse(_maxCtrl.text.trim());
    widget.onChanged(min, max);
  }

  @override
  Widget build(BuildContext context) {
    final pink = const Color(0xFFD95D85);
    final baseDecoration = InputDecoration(
      isDense: true,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: pink, width: 1.4)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _minCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: false),
            decoration: baseDecoration.copyWith(labelText: 'products.filter_panel.price_min'.tr()),
            onChanged: (_) => _emit(),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: TextField(
            controller: _maxCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: false),
            decoration: baseDecoration.copyWith(labelText: 'products.filter_panel.price_max'.tr()),
            onChanged: (_) => _emit(),
          ),
        ),
      ],
    );
  }
}
