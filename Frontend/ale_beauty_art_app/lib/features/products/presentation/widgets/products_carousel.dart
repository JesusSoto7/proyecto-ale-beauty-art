import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductsCarousel extends StatefulWidget {
  const ProductsCarousel({super.key});

  @override
  State<ProductsCarousel> createState() => _ProductsCarouselState();
}

class _ProductsCarouselState extends State<ProductsCarousel> {
  final PageController _pageController = PageController(viewportFraction: 0.38);// Ajusta visibilidad de productos
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

          return SizedBox(
            height: 230,
            child: Stack(
              alignment: Alignment.center,
              children: [
                PageView.builder(
                  controller: _pageController,
                  padEnds: false,
                  itemCount: _productosDestacados.length,
                  onPageChanged: (index) => setState(() => _currentPage = index),
                  itemBuilder: (context, index) {
                    final product = _productosDestacados[index];
                    return Container(
                      width: 140,
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailView(product: product),
                            ),
                          );
                        },
                        child: Card(
                          elevation: 4,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Imagen con fondo degradado
                              Stack(
                                children: [
                                  Container(
                                    height: 100,
                                    margin: const EdgeInsets.all(8), // margen de la imagen
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(12),
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: [
                                          Colors.pink.shade100,
                                          Colors.pinkAccent.shade100,
                                        ],
                                      ),
                                    ),
                                    child: (product.imagenUrl != null && product.imagenUrl!.isNotEmpty)
                                        ? ClipRRect(
                                            borderRadius: const BorderRadius.all(Radius.circular(12)),
                                            child: Image.network(
                                              product.imagenUrl!,
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) {
                                                return const Center(
                                                  child: Text(
                                                    '💋',
                                                    style: TextStyle(fontSize: 32),
                                                  ),
                                                );
                                              },
                                            ),
                                          )
                                        : const Center(
                                            child: Text(
                                              '💋',
                                              style: TextStyle(fontSize: 32),
                                            ),
                                          ),
                                  ),
                                ],
                              ),
                               Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      SizedBox(
                                        width: double.infinity,
                                        child: Text(
                                          product.nombreProducto,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 16,
                                            color: Color(0xFF1F2937),
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          softWrap: false,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '\$${product.precioProducto.toStringAsFixed(2)}',
                                        style: AppTextStyles.price.copyWith(
                                          color: Colors.pinkAccent,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                        ),
                                      ),
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
                    child: _arrowButton(icon: Icons.arrow_back_ios, onPressed: _previousPage),
                  ),

                // Botón derecho
                if (_currentPage < _productosDestacados.length - 1)
                  Positioned(
                    right: 8,
                    child: _arrowButton(icon: Icons.arrow_forward_ios, onPressed: () => _nextPage(_productosDestacados.length)),
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

  Widget _arrowButton({required IconData icon, required VoidCallback onPressed}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.primaryPink, //  Rosado clarito
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 1.5),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(2, 2)),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, size: 18, color: Colors.white),
        onPressed: onPressed,
      ),
    );
  }
}
