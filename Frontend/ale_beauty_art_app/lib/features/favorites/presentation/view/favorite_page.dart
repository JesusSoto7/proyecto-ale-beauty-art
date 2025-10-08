import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';

class FavoritePage extends StatelessWidget {
  const FavoritePage({super.key});

  @override
  Widget build(BuildContext context) {
    // Cargar favoritos al entrar a la vista
    context.read<FavoriteBloc>().add(LoadFavorites());

    return Scaffold(
      appBar: AppBar(title: const Text("Mis Favoritos")),
      body: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, state) {
          if (state is FavoriteLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is FavoriteError) {
            return Center(child: Text(state.message));
          }
          if (state is FavoriteSuccess) {
            final favorites = state.favorites;
            if (favorites.isEmpty) {
              return const Center(
                  child: Text("No tienes productos favoritos."));
            }
            return ListView.builder(
                itemCount: favorites.length,
                itemBuilder: (context, index) {
                  final fav = favorites[index];
                  return Card(
                    margin:
                        const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                    child: Row(
                      children: [
                        fav.imagenUrl != null
                            ? Image.network(fav.imagenUrl!,
                                width: 60, height: 60, fit: BoxFit.cover)
                            : const Icon(Icons.image_not_supported, size: 60),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ListTile(
                            title: Text(fav.nombreProducto),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (fav.categoria != null &&
                                    fav.categoria!.isNotEmpty)
                                  Text(fav.categoria!,
                                      style: const TextStyle(fontSize: 12)),
                                Text('\$${fav.precioProducto}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold)),
                                _stockText(fav.stock),
                              ],
                            ),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      ProductDetailView(productId: fav.id),
                                ),
                              );
                            },
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            context
                                .read<FavoriteBloc>()
                                .add(RemoveFavorite(fav.id));
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.shopping_cart,
                              color: Colors.purple),
                          onPressed: () {
                            context
                                .read<CartBloc>()
                                .add(AddProductToCart(productId: fav.id));
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content:
                                        Text("Producto añadido al carrito")));
                          },
                        ),
                      ],
                    ),
                  );
                });
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: BlocBuilder<FavoriteBloc, FavoriteState>(
        builder: (context, state) {
          if (state is FavoriteSuccess && state.favorites.isNotEmpty) {
            return Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton.extended(
                  onPressed: () {
                    context.read<FavoriteBloc>().add(ClearFavorites());
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content: Text("Todos los favoritos eliminados")));
                  },
                  icon: const Icon(Icons.clear_all),
                  label: const Text("Limpiar Favoritos"),
                  backgroundColor: Colors.redAccent,
                ),
                const SizedBox(width: 16),
                FloatingActionButton.extended(
                  onPressed: () {
                    context.read<FavoriteBloc>().add(AddAllFavoritesToCart());
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        content:
                            Text("Todos los favoritos añadidos al carrito")));
                  },
                  icon: const Icon(Icons.shopping_cart),
                  label: const Text("Agregar todos"),
                  backgroundColor: Colors.green,
                ),
              ],
            );
          }
          return const SizedBox.shrink();
        },
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
              TextStyle(color: Color(0xFFff5405), fontWeight: FontWeight.bold));
    } else {
      return const Text("Agotado",
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold));
    }
  }
}
