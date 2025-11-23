import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';

class FavoritePage extends StatelessWidget {
  const FavoritePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Actualiza token del FavoriteBloc si hay sesión
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthSuccess) {
      context.read<FavoriteBloc>().add(UpdateFavoriteToken(authState.token));
    }
    context.read<FavoriteBloc>().add(LoadFavorites());

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.20),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            title: Text(
              'favorites.title'.tr(),
              style: const TextStyle(
                color: Color.fromARGB(255, 0, 0, 0),
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Colors.black87,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
          ),
        ),
      ),
      backgroundColor: const Color(0xFFF8F5F7),
      body: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, state) {
          if (state is FavoriteLoading) {
            return LoadingView();
          }
          if (state is FavoriteError) {
            return Center(child: Text(state.message));
          }
          if (state is FavoriteSuccess) {
            final favorites = state.favorites;
            if (favorites.isEmpty) {
              return Center(
                child: Text(
                  'favorites.empty'.tr(),
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                final fav = favorites[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color.fromARGB(82, 209, 205, 206)
                            .withOpacity(0.5),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () {
                      // Mapear FavoriteProduct -> Product mínimamente para navegar sin tocar ProductBloc
                      final product = Product(
                        id: fav.id,
                        nombreProducto: fav.nombreProducto,
                        precioProducto: fav.precioProducto.round(),
                        descripcion: '',
                        subCategoryId: 0,
                        stock: fav.stock,
                        nombreSubCategoria: '',
                        categoryId: 0,
                        nombreCategoria: fav.categoria ?? '',
                        imagenUrl: fav.imagenUrl,
                      );

                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ProductDetailView(product: product),
                        ),
                      );
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: _favoriteImage(fav.imagenUrl),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  fav.nombreProducto,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF2E1A2D),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                if (fav.categoria != null &&
                                    fav.categoria!.isNotEmpty)
                                  Text(
                                    fav.categoria!,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: Color(0xFF9E6A8E),
                                    ),
                                  ),
                                const SizedBox(height: 6),
                                Text(
                                  '\$${fav.precioProducto.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: Color.fromARGB(255, 102, 61, 82),
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                _stockText(fav.stock),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          Column(
                            children: [
                              _circleIcon(
                                icon: Icons.delete_outline,
                                color: const Color.fromARGB(255, 218, 112, 144),
                                onTap: () => context
                                    .read<FavoriteBloc>()
                                    .add(RemoveFavorite(fav.id)),
                              ),
                              const SizedBox(height: 8),
                              _circleIcon(
                                icon: Icons.add_shopping_cart_rounded,
                                color: const Color.fromARGB(255, 182, 92, 142),
                                onTap: () {
                                  context
                                      .read<CartBloc>()
                                      .add(AddProductToCart(productId: fav.id));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text(
                                            "Producto añadido al carrito")),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, state) {
          if (state is FavoriteSuccess && state.favorites.isNotEmpty) {
            return Padding(
              padding: const EdgeInsets.only(left: 32.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _gradientButton(
                    label: "Limpiar Favoritos",
                    icon: Icons.delete_sweep_rounded,
                    gradientColors: const [
                      Color.fromARGB(132, 219, 120, 153),
                      Color.fromARGB(153, 151, 72, 105)
                    ],
                    onTap: () {
                      context.read<FavoriteBloc>().add(ClearFavorites());
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                          content: Text("Todos los favoritos eliminados")));
                    },
                  ),
                  _gradientButton(
                    label: "Agregar Todos",
                    icon: Icons.shopping_bag_rounded,
                    gradientColors: const [
                      Color.fromARGB(195, 179, 57, 108),
                      Color.fromRGBO(212, 142, 177, 0.993)
                    ],
                    onTap: () {
                      context.read<FavoriteBloc>().add(AddAllFavoritesToCart());
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                          content:
                              Text("Todos los favoritos añadidos al carrito")));
                    },
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _circleIcon(
      {required IconData icon,
      required Color color,
      required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 22),
      ),
    );
  }

  Widget _gradientButton({
    required String label,
    required IconData icon,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Container(
        height: 48,
        margin: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(50),
          boxShadow: [
            BoxShadow(
              color: gradientColors.last.withOpacity(0.4),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ElevatedButton.icon(
          onPressed: onTap,
          icon: Icon(icon, color: Colors.white),
          label: Text(label,
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
          ),
        ),
      ),
    );
  }

  Widget _stockText(int stock) {
    if (stock > 9) {
      return const Text("En stock",
          style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold));
    } else if (stock > 5) {
      return const Text("Pocas unidades",
          style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold));
    } else if (stock > 0) {
      return const Text("Últimas unidades",
          style:
              TextStyle(color: Color(0xFFD95D85), fontWeight: FontWeight.bold));
    } else {
      return const Text("Agotado",
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold));
    }
  }

  Widget _favoriteImage(String? url) {
    if (url == null || url.isEmpty) {
      return _placeholderBox();
    }
    return Image.network(
      url,
      width: 90,
      height: 90,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stack) => _placeholderBox(),
      loadingBuilder: (context, child, progress) {
        if (progress == null) return child;
        return Container(
          width: 90,
          height: 90,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: Colors.grey.shade200),
          child: SizedBox(
            width: 26,
            height: 26,
            child: CircularProgressIndicator(
              strokeWidth: 2.4,
              value: progress.expectedTotalBytes != null
                  ? progress.cumulativeBytesLoaded /
                      (progress.expectedTotalBytes ?? 1)
                  : null,
            ),
          ),
        );
      },
    );
  }

  Widget _placeholderBox() {
    return Container(
      width: 90,
      height: 90,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
      ),
      child: const Icon(Icons.image_not_supported, color: Colors.grey, size: 40),
    );
  }
}
