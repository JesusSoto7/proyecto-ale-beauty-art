import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';

class ProductDetailView extends StatefulWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  bool _isImageLoaded = false;

  void _markImageLoaded() {
    if (!_isImageLoaded && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _isImageLoaded = true);
      });
    }
  }

  @override
  void initState() {
    super.initState();
    // Ya no disparamos eventos al ProductBloc; usamos el producto recibido
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    return Scaffold(
            backgroundColor: const Color.fromARGB(255, 247, 246, 246),
            appBar: AppBar(
              backgroundColor: const Color.fromARGB(255, 255, 238, 243),
              automaticallyImplyLeading: false,
              leading: IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: Color.fromARGB(255, 248, 174, 174),
                ),
                onPressed: () => Navigator.pop(context),
              ),
              actions: [
                _FavoriteButton(productId: product.id),
              ],
            ),
            body: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ----------------------
                  // Contenedor imagen + shimmer
                  // ----------------------
                  Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOut,
                        height: 260,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: _isImageLoaded
                              ? Colors.white
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: (product.imagenUrl != null && product.imagenUrl!.isNotEmpty)
                            ? Stack(
                                children: [
                                  // Imagen (abajo)
                                  Positioned.fill(
                                    child: Image.network(
                                      product.imagenUrl!,
                                      fit: BoxFit.fitHeight,
                                      frameBuilder: (context, child, frame,
                                          wasSynchronouslyLoaded) {
                                        if (wasSynchronouslyLoaded) {
                                          _markImageLoaded();
                                          return child;
                                        }
                                        if (frame == null) {
                                          return const SizedBox.shrink();
                                        } else {
                                          _markImageLoaded();
                                          return child;
                                        }
                                      },
                                      errorBuilder:
                                          (context, error, stackTrace) {
                                        _markImageLoaded();
                                        return const Center(
                                          child: Text(
                                            '💋',
                                            style: TextStyle(
                                              fontSize: 64,
                                              color: AppColors.primaryPink,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  if (!_isImageLoaded)
                                    Positioned.fill(
                                      child: Shimmer.fromColors(
                                        baseColor: Colors.grey.shade300,
                                        highlightColor: Colors.grey.shade100,
                                        child: Container(
                                          height: 260,
                                          width: double.infinity,
                                          color: Colors.grey.shade300,
                                        ),
                                      ),
                                    ),
                                ],
                              )
                            : const Center(
                                child: Text(
                                  '💋',
                                  style: TextStyle(
                                    fontSize: 64,
                                    color: AppColors.primaryPink,
                                  ),
                                ),
                              ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Nombre y precio
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product.nombreProducto,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      Text(
                        formatPriceCOP(product.precioProducto),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryPink,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Badge categoría
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.pink.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      product.nombreCategoria,
                      style: const TextStyle(
                        color: AppColors.primaryPink,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ),

                  // Descripción
                  Text(
                    product.descripcion,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Color(0xFF374151),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),

            // Botones
            bottomNavigationBar: SafeArea(
              minimum: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: OutlinedButton(
                      onPressed: () async {
                        final authState = context.read<AuthBloc>().state;

                        if (authState is! AuthSuccess) {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const LoginPage()),
                          );

                          if (result == true) {
                            final auth =
                                context.read<AuthBloc>().state as AuthSuccess;

                            context
                                .read<CartBloc>()
                                .add(UpdateCartToken(auth.token));

                            // Agregar producto
                            context.read<CartBloc>().add(
                                  AddProductToCart(productId: product.id),
                                );

                            // Recargar carrito para que se vea reflejado
                            context.read<CartBloc>().add(LoadCart());
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text(
                                  'Producto Agregado',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold),
                                ),
                                backgroundColor: AppColors.primaryPink,
                                behavior: SnackBarBehavior.floating,
                                margin:
                                    const EdgeInsets.fromLTRB(20, 0, 20, 30),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(16)),
                                elevation: 6,
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          } else {
                            return; // Canceló login
                          }
                        } else {
                          final auth = authState;
                          context
                              .read<CartBloc>()
                              .add(UpdateCartToken(auth.token));
                          context.read<CartBloc>().add(
                                AddProductToCart(productId: product.id),
                              );
                          context.read<CartBloc>().add(LoadCart());

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text(
                                'Producto Agregado',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold),
                              ),
                              backgroundColor: AppColors.primaryPink,
                              behavior: SnackBarBehavior.floating,
                              margin: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16)),
                              elevation: 6,
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(
                            color: AppColors.primaryPink, width: 1.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                      child: const Icon(
                        Icons.add_shopping_cart,
                        color: AppColors.primaryPink,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryPink,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 23),
                      ),
                      child: const Text(
                        "Comprar ahora",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _FavoriteButton extends StatefulWidget {
  final int productId;
  const _FavoriteButton({required this.productId});

  @override
  State<_FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<_FavoriteButton> {
  bool _busy = false;
  bool _isFav = false; // Simple UI toggle; optional: preload from FavoriteBloc state

  Future<void> _toggle() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is! AuthSuccess) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginPage()),
        );
        if (result != true) {
          setState(() => _busy = false);
          return;
        }
      }

      final auth = context.read<AuthBloc>().state as AuthSuccess;

      // Asegurar que FavoriteBloc tenga el token actualizado
      context.read<FavoriteBloc>().add(UpdateFavoriteToken(auth.token));

      if (_isFav) {
        context.read<FavoriteBloc>().add(RemoveFavorite(widget.productId));
      } else {
        context.read<FavoriteBloc>().add(AddFavorite(widget.productId));
      }
      setState(() => _isFav = !_isFav);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: _busy
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Icon(
              _isFav ? Icons.favorite : Icons.favorite_border,
              color: _isFav ? const Color(0xFFD95D85) : Colors.grey,
            ),
      onPressed: _toggle,
      tooltip: _isFav ? 'Quitar de favoritos' : 'Agregar a favoritos',
    );
  }
}
