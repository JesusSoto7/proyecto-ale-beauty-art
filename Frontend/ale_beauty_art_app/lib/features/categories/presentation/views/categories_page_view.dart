import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../products/presentation/bloc/product_bloc.dart';
import '../../../products/presentation/views/products_by_category_view.dart';
import 'subcategories_view.dart';
import '../bloc/categories_bloc.dart';
import '../../../../styles/colors.dart';
import 'dart:math' as math;

class CategoriesPageView extends StatelessWidget {
  const CategoriesPageView({super.key});

  @override
  Widget build(BuildContext context) {
    // Ajuste dinámico: incorporar padding superior del sistema para evitar overflow del título.
    final double topInset = MediaQuery.of(context).padding.top;
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(topInset + kToolbarHeight),
        child: Container(
          padding: EdgeInsets.only(top: topInset),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: SizedBox(
            height: kToolbarHeight,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      'nav.categories'.tr(),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      resizeToAvoidBottomInset: false,
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      body: BlocBuilder<CategoriesBloc, CategoriesState>(
        builder: (context, state) {
          if (state is CategoriesLoadInProgress) {
            return const Center(child: LoadingView());
          } else if (state is CategoriesLoadSuccess) {
            final categories = state.categories;

            return Padding(
              padding: const EdgeInsets.all(12.0), // Menos padding general
              child: GridView.builder(
                padding: EdgeInsets.zero,
                itemCount: categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 2 círculos por fila
                  mainAxisSpacing: 20, // Menos espacio vertical
                  crossAxisSpacing: 12, // Menos espacio horizontal
                  childAspectRatio: 1, // Más ajustado
                ),
                itemBuilder: (context, index) {
                  final category = categories[index];

                  return Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(16),
                      onTap: () {
                        final allProductsState = context.read<ProductBloc>().state;
                        if (allProductsState is ProductLoadSuccess) {
                          final filteredTap = allProductsState.products
                              .where((p) => p.categoryId == category.id)
                              .toList();
                          final hasSubcatsTap =
                              filteredTap.any((p) => p.subCategoryId != 0);
                          if (hasSubcatsTap) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => SubCategoriesView(
                                  categoryId: category.id,
                                  categoryName: category.nombreCategoria,
                                  allProductsInCategory: filteredTap,
                                ),
                              ),
                            );
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ProductsByCategoryView(
                                  categoryId: category.id,
                                  categoryName: category.nombreCategoria,
                                  products: filteredTap,
                                ),
                              ),
                            );
                          }
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('categories.products_not_available'.tr()),
                            ),
                          );
                        }
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.06),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            // Ajuste responsivo para evitar overflows verticales en tarjetas pequeñas
                            final shortest = math.min(constraints.maxWidth, constraints.maxHeight);
                            // Escalamos el círculo dentro de [84, 120]
                            final circleSize = shortest.isFinite
                                ? (shortest * 0.58).clamp(84.0, 120.0)
                                : 120.0;
                            final avatarRadius = (circleSize / 2) - 8; // margen interno para el aro

                            return Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                // Imagen con aro y fondo suave (tamaño adaptable)
                                Container(
                                  width: circleSize,
                                  height: circleSize,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.pink.shade50,
                                        Colors.pink.shade50.withValues(alpha: 0.6),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                  ),
                                  child: Center(
                                    child: CircleAvatar(
                                      radius: avatarRadius,
                                      backgroundColor: Colors.white,
                                      backgroundImage: category.imagen.isNotEmpty
                                          ? NetworkImage(category.imagen)
                                          : null,
                                      child: category.imagen.isEmpty
                                          ? Text(
                                              '💄',
                                              style: TextStyle(
                                                fontSize: (circleSize * 0.28).clamp(22.0, 34.0),
                                                color: AppColors.primaryPink,
                                              ),
                                            )
                                          : null,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                // Nombre (envuelto en Flexible para ceder espacio si es necesario)
                                Flexible(
                                  child: Padding(
                                    padding: const EdgeInsets.only(bottom: 1), // evita recorte inferior del texto
                                    child: Text(
                                      category.nombreCategoria,
                                      textAlign: TextAlign.center,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF374151),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                // (Conteo oculto por solicitud)
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          } else if (state is CategoriesLoadFailure) {
            return FailureView();
          } else {
            return FailureView();
          }
        },
      ),
    );
  }
}
