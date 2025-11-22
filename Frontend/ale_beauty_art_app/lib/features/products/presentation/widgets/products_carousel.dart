import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/favorite_toggle_button.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsCarousel extends StatefulWidget {
  final bool compact;
  const ProductsCarousel({super.key, this.compact = false});

  @override
  State<ProductsCarousel> createState() => _ProductsCarouselState();
}

class _ProductsCarouselState extends State<ProductsCarousel> {
  final PageController _pageController = PageController(viewportFraction: 0.42);
  int _currentPage = 0;
  late List<dynamic> _productosDestacados;

  @override
  void initState() {
    super.initState();
    _productosDestacados = [];
  }

  void _nextPage(int max) {
    if (_currentPage < max - 1) {
      _currentPage++;
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {});
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _currentPage--;
      _pageController.animateToPage(
        _currentPage,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductBloc, ProductState>(
      builder: (context, state) {
        if (state is ProductLoadSuccess) {
          if (_productosDestacados.isEmpty) {
            final shuffled = List.of(state.products)..shuffle();
            _productosDestacados = shuffled.take(6).toList();
          }

          final bool compact = widget.compact;
          // Reduced sizes to avoid small overflows on some screens
          final double carouselHeight = compact ? 196 : 236;
          final double cardHeight = compact ? 186 : 218;
          final double imageHeight = compact ? 112 : 130;
          final double screenW = MediaQuery.of(context).size.width;
          final double cardWidth = screenW * (compact ? 0.42 : 0.42);

          return SizedBox(
            height: carouselHeight, // Limitar altura total del carrusel
            child: Stack(
              alignment: Alignment.center,
              children: [
                PageView.builder(
                  controller: _pageController,
                  padEnds: false,
                  itemCount: _productosDestacados.length,
                  onPageChanged: (index) =>
                      setState(() => _currentPage = index),
                  itemBuilder: (context, index) {
                    final product = _productosDestacados[index];

                    return Container(
                      width: cardWidth,
                      margin: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 6, // 🆕 Margen vertical para evitar corte
                      ),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  ProductDetailView(product: product),
                            ),
                          );
                        },
                        child: Container(
                          height: cardHeight, // Limitar altura de la tarjeta
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 5,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          // 🔥 Sin ClipRRect aquí para evitar la línea
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Imagen con badge de descuento y favorito
                              Container(
                                height: imageHeight,
                                decoration: const BoxDecoration(
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(18),
                                    topRight: Radius.circular(18),
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    // 🖼️ Imagen que cubre todo el espacio
                                    ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(18),
                                        topRight: Radius.circular(18),
                                      ),
                                      child: Container(
                                        width: double.infinity,
                                        height: double.infinity,
                                        color: const Color(0xFFFAFAFA),
                                        child: (product.imagenUrl?.isNotEmpty ??
                                                false)
                                            ? Image.network(
                                                product.imagenUrl!,
                                                fit: BoxFit
                                                    .cover, // 🔥 Cambiado a cover
                                                width: double.infinity,
                                                height: double.infinity,
                                                errorBuilder: (_, __, ___) => Center(
                                                  child: Icon(
                                                    Icons.image_not_supported_outlined,
                                                    size: 45,
                                                    color: Colors.grey[300],
                                                  ),
                                                ),
                                              )
                                            : Center(
                                                child: Icon(
                                                  Icons.image_outlined,
                                                  size: 45,
                                                  color: Colors.grey[300],
                                                ),
                                              ),
                                                    ),
                                    ),
                                    // 🎉 Badge de descuento compacto
                                    if (product.tieneDescuento)
                                      Positioned(
                                        top: 10,
                                        left: 10,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 5,
                                          ),
                                          decoration: BoxDecoration(
                                            gradient: const LinearGradient(
                                              begin: Alignment.topLeft,
                                              end: Alignment.bottomRight,
                                              colors: [
                                                Color.fromARGB(
                                                    255, 197, 78, 118),
                                                Color.fromARGB(
                                                    255, 218, 55, 106),
                                              ],
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                            boxShadow: [
                                              BoxShadow(
                                                color: const Color(0xFFFF6B9D)
                                                    .withOpacity(0.4),
                                                blurRadius: 6,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(
                                                Icons.local_offer,
                                                color: Colors.white,
                                                size: 11,
                                              ),
                                              const SizedBox(width: 3),
                                              Text(
                                                '-${product.porcentajeDescuento}%',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 11,
                                                  letterSpacing: 0.3,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),

                                    // Botón de favoritos con fondo blanco
                                    Positioned(
                                      top: 8,
                                      right: 8,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          shape: BoxShape.circle,
                                          boxShadow: [
                                            BoxShadow(
                                              color:
                                                  Colors.black.withOpacity(0.1),
                                              blurRadius: 6,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: FavoriteToggleButton(
                                          productId: product.id,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Información del producto con fondo blanco (flexible para evitar overflow)
                              Flexible(
                                fit: FlexFit.loose,
                                child: Container(
                                  width: double.infinity,
                                  padding:
                                      const EdgeInsets.fromLTRB(12, 6, 12, 6),
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.only(
                                      bottomLeft: Radius.circular(18),
                                      bottomRight: Radius.circular(18),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    mainAxisAlignment:
                                        MainAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      // Nombre del producto (máximo 2 líneas)
                                      Flexible(
                                        fit: FlexFit.loose,
                                        child: Align(
                                          alignment: Alignment.topLeft,
                                          child: Text(
                                            product.nombreProducto,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13,
                                              color: Color(0xFF2D2D2D),
                                              height: 1.2,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 4),

                                      // Precios
                                      if (product.tieneDescuento)
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            // Precio original tachado
                                            Text(
                                              formatPriceCOP(
                                                  product.precioProducto),
                                              style: TextStyle(
                                                color: Colors.grey[500],
                                                fontSize: 11,
                                                decoration:
                                                    TextDecoration.lineThrough,
                                                decorationColor:
                                                    Colors.grey[400],
                                                decorationThickness: 1.5,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            // Precio con descuento
                                            Text(
                                              formatPriceCOP(product
                                                  .precioConMejorDescuento!),
                                              style: const TextStyle(
                                                color: Color(0xFFD95D85),
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15,
                                                letterSpacing: -0.3,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        )
                                      else
                                        Text(
                                          formatPriceCOP(
                                              product.precioProducto),
                                          style: const TextStyle(
                                            color: Color(0xFFD95D85),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 15,
                                            letterSpacing: -0.3,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      const SizedBox(height: 6),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),

                // Botón izquierdo
                if (_currentPage > 0)
                  Positioned(
                    left: 8,
                    child: _arrowButton(
                        icon: Icons.arrow_back_ios, onPressed: _previousPage),
                  ),

                // Botón derecho
                if (_currentPage < _productosDestacados.length - 1)
                  Positioned(
                    right: 8,
                    child: _arrowButton(
                        icon: Icons.arrow_forward_ios,
                        onPressed: () =>
                            _nextPage(_productosDestacados.length)),
                  ),
              ],
            ),
          );
        } else if (state is ProductLoadInProgress) {
          return const LoadingView();
        } else {
          return const Text('No se pudieron cargar los productos.');
        }
      },
    );
  }

  Widget _arrowButton(
      {required IconData icon, required VoidCallback onPressed}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primaryPink,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, size: 18, color: Colors.white),
        onPressed: onPressed,
      ),
    );
  }
}
