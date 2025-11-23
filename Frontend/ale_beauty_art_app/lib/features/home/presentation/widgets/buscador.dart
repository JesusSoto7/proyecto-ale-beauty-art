import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
// products_page_view is not needed here because we navigate via NavigationBloc and ProductBloc

class ExpandableSearchBar extends StatefulWidget {
  const ExpandableSearchBar({super.key});

  @override
  State<ExpandableSearchBar> createState() => _ExpandableSearchBarState();
}

class _ExpandableSearchBarState extends State<ExpandableSearchBar> {
  bool _isExpanded = false;
  final FocusNode _focusNode = FocusNode();
  final TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus) {
        setState(() => _isExpanded = false);
      }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Colores inspirados en la imagen proporcionada
    const Color pastelRose = Color(0xFFFFEEF3);

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: LayoutBuilder(
        builder: (context, constraints) {
          final maxWidth = constraints.maxWidth;
          return Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(18),
                clipBehavior: Clip.antiAlias,
                child: AnimatedContainer(
                duration: const Duration(milliseconds: 280),
                  // Aumenta el ancho colapsado para evitar overflow visual junto al ícono
                  width: _isExpanded ? maxWidth : 52,
                  height: 40, // Ajuste para evitar recorte inferior (bottom pixel issue)
                  decoration: BoxDecoration(
                    color: pastelRose,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.pink.withOpacity(0.09),
                        blurRadius: 8,
                        offset: const Offset(0, 1),
                      ),
                    ],
                    border: Border.all(
                      color: Colors.white.withOpacity(0.7),
                      width: 1.2,
                    ),
                  ),
                  child: Row(
                    children: [
                      ConstrainedBox(
                        constraints: const BoxConstraints(minWidth: 40, maxWidth: 44),
                        child: IconButton(
                          icon: Icon(Icons.search,
                              color: AppColors.primaryPink, size: 22),
                          onPressed: () {
                        final query = _controller.text.trim();
                          if (query.isNotEmpty) {
                            _submitSearch(context);
                            return;
                          }

                          // Si no hay texto, solo expandir y enfocar; NO navegar
                          if (!_isExpanded) {
                            setState(() => _isExpanded = true);
                            Future.delayed(const Duration(milliseconds: 100), () {
                              if (mounted) FocusScope.of(context).requestFocus(_focusNode);
                            });
                          }
                          // Si ya está expandido y vacío, solo enfocar de nuevo
                          else {
                            FocusScope.of(context).requestFocus(_focusNode);
                          }
                          },
                          padding: EdgeInsets.zero,
                          splashRadius: 20,
                        ),
                      ),
                      if (_isExpanded)
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 2),
                            child: TextField(
                              focusNode: _focusNode,
                              controller: _controller,
                              onSubmitted: (_) => _submitSearch(context),
                              decoration: InputDecoration(
                                hintText: 'search.placeholder'.tr(),
                                hintStyle: const TextStyle(
                                  color: Color(0xFFD95D85),
                                  fontSize: 15.5,
                                  fontWeight: FontWeight.w400,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.symmetric(
                                    vertical: 10, horizontal: 10),
                              ),
                              style: const TextStyle(
                                color: Color(0xFF222222),
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _submitSearch(BuildContext context) async {
    final query = _controller.text.trim();
    FocusScope.of(context).unfocus();
    // Cambiar a la pestaña Productos y aplicar el filtro en el ProductBloc
    // Esto evita empujar una nueva ruta sobre la pantalla actual y evita problemas
    // para volver atrás.
    final productBloc = context.read<ProductBloc>();
    final navBloc = context.read<NavigationBloc>();

    // Construir nuevo filtro conservando valores existentes cuando sea posible
    ProductFilter newFilter;
    final state = productBloc.state;
    if (state is ProductLoadSuccess) {
      newFilter = state.filter.copyWith(searchQuery: query.isEmpty ? null : query);
    } else {
      newFilter = ProductFilter(searchQuery: query.isEmpty ? null : query);
    }

    productBloc.add(ProductFilterChanged(newFilter));
    navBloc.add(const NavigationTabChanged(1));

    if (!mounted) return;
    // Mantener el buscador colapsado y limpiar el texto
    setState(() {
      _isExpanded = false;
      _controller.clear();
    });
  }
}
