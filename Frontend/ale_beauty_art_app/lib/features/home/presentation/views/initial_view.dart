import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/view/cart_page_view.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/bloc/categories_bloc.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/views/categories_page_view.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/products_carousel.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/views/profile_view.dart';


import 'package:ale_beauty_art_app/styles/colors.dart'; // Estilos
import 'package:ale_beauty_art_app/styles/text_styles.dart'; // Tipografías

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../widgets/carousel_widget.dart';

class InitialView extends StatelessWidget {
  const InitialView({super.key});

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final canPop = Navigator.of(context).canPop();
        return !canPop; // Solo permite salir si no hay nada en la pila
      },
      child: Scaffold(
        backgroundColor: AppColors.background,

        // ✅ AppBar con logo y barra de búsqueda
        appBar: AppBar(
          backgroundColor: AppColors.primaryPink,
          automaticallyImplyLeading: false,
          elevation: 0,
          title: Row(
            children: [
              // 🔥 Logo
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  'assets/images/ale_logo.png',
                  height: 50,
                  width: 50,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 12),
              // 🔥 Barra de búsqueda
              Expanded(
                child: Container(
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar...',
                      prefixIcon: Icon(Icons.search, color: AppColors.primaryPink),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Contenido según la pestaña seleccionada
        body: BlocBuilder<NavigationBloc, NavigationState>(
          builder: (context, state) {
            if (state is NavigationUpdated) {
              switch (state.selectedIndex) {
                case 0:
                  return _homeContent(context);
                case 1:
                  return const ProductsPageView();
                case 2:
                  return const CategoriesPageView();
                case 3:
                  return const ProfileView();
                default:
                  return _homeContent(context);
              }
            } else {
              return _homeContent(context);
            }
          },
        ),

        // ✅ FAB (Carrito) más pequeño y abajo
        floatingActionButton: SizedBox(
          height: 60,
          width: 60,
          child: FloatingActionButton(
            backgroundColor: Colors.white,
            hoverColor: Colors.grey.withOpacity(0.1), 
            splashColor: AppColors.primaryPink.withOpacity(0.1),
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(50),
            ),
            child: Icon(
              Icons.shopping_cart_sharp,
              color: AppColors.primaryPink,
              size: 28,
            ),
            onPressed: () async {
              final authState = context.read<AuthBloc>().state;

              if (authState is! AuthSuccess) {
                // 🚨 No autenticado: abre LoginPage
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                );

                if (result == true) {
                  // ✅ Si inició sesión correctamente
                  final auth = context.read<AuthBloc>().state as AuthSuccess;

                  // 🔥 Actualiza token del CartBloc
                  context.read<CartBloc>().add(UpdateCartToken(auth.token));

                  // 🛒 Abre carrito y carga
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const CartPageView()),
                  );

                  context.read<CartBloc>().add(LoadCart());
                }
              } else {
                // Ya autenticado
                final auth = authState;

                // 🔥 Actualiza token del CartBloc
                context.read<CartBloc>().add(UpdateCartToken(auth.token));

                // 🛒 Abre carrito y carga
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CartPageView()),
                );

                context.read<CartBloc>().add(LoadCart());
              }
            },
          ),
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

        // ✅ BottomAppBar ajustado
        bottomNavigationBar: BlocBuilder<NavigationBloc, NavigationState>(
          builder: (context, state) {
            final currentIndex =(state is NavigationUpdated) ? state.selectedIndex : 0;
            context.read<ProductBloc>().add(ProductFetched());

            return BottomAppBar(
              height: 80,
              color: Colors.white,
              elevation: 8,
              shape: const AutomaticNotchedShape(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.zero,
                ),
              ),
              notchMargin: 10,
              child: SizedBox(
                height: 60,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly, //  Íconos más centrados
                  children: [
                    // Inicio
                    GestureDetector(
                      child: Material(
                        color: Colors.transparent, // Quita el fondo fijo
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          splashColor: AppColors.primaryPink.withOpacity(0.1), //  Ripple
                          radius: 25, // 📏 Radio más grande para cubrir ícono + texto
                          onTap: () {
                            context.read<NavigationBloc>().add(NavigationTabChanged(0));
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), // Espacio para ícono + texto
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.home_rounded,
                                  color: (currentIndex == 0)
                                      ? AppColors.primaryPink // Icono activo rosado
                                      : Colors.grey[500],
                                  size: 24,
                                ),

                                Text(
                                  'Inicio',
                                  style: TextStyle(
                                    color: (currentIndex == 0)
                                        ? AppColors.primaryPink // Texto activo rosado
                                        : Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    // 🛒 Productos
                    GestureDetector(
                      child: Material(
                        color: Colors.transparent, // Quita el fondo fijo
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          splashColor: AppColors.primaryPink.withOpacity(0.1), //  Ripple
                          radius: 25, // 📏 Radio más grande para cubrir ícono + texto
                          onTap: () {
                            context.read<NavigationBloc>().add(NavigationTabChanged(1));
                            context.read<ProductBloc>().add(ProductFetched());
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), // Espacio para ícono + texto
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.grid_view_rounded,
                                  color: (currentIndex == 1)
                                      ? AppColors.primaryPink // Icono activo rosado
                                      : Colors.grey[500],
                                  size: 24,
                                ),
                                Text(
                                  'Productos',
                                  style: TextStyle(
                                    color: (currentIndex == 1)
                                        ? AppColors.primaryPink // Texto activo rosado
                                        : Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 15),
                    GestureDetector(
                      child: Material(
                        color: Colors.transparent, // Quita el fondo fijo
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          splashColor: AppColors.primaryPink.withOpacity(0.1), //  Ripple
                          radius: 25, //  Radio más grande para cubrir ícono + texto
                          onTap: () {
                            context.read<NavigationBloc>().add(NavigationTabChanged(2));
                            context.read<ProductBloc>().add(ProductFetched());
                            context.read<CategoriesBloc>().add(CategoriesFetched());
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), //Espacio para ícono + texto
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.category_rounded,
                                  color: (currentIndex == 2)
                                      ? AppColors.primaryPink // Icono activo rosado
                                      : Colors.grey[500],
                                  size: 24,
                                ),
                                Text(
                                  'Categorias',
                                  style: TextStyle(
                                    color: (currentIndex == 2)
                                        ? AppColors.primaryPink // Texto activo rosado
                                        : Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    // 👤 Perfil
                                        GestureDetector(
                      child: Material(
                        color: Colors.transparent, // Quita el fondo fijo
                        shape: const CircleBorder(),
                        child: InkWell(
                          customBorder: const CircleBorder(),
                          splashColor: AppColors.primaryPink.withOpacity(0.1), // Ripple
                          radius: 25, // 📏 Radio más grande para cubrir ícono + texto
                          onTap: () {
                            context.read<NavigationBloc>().add(NavigationTabChanged(3));
                            context.read<AuthBloc>();
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), //  Espacio para ícono + texto
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.person,
                                  color: (currentIndex == 3)
                                      ? AppColors.primaryPink // Icono activo rosado
                                      : Colors.grey[500],
                                  size: 24,
                                ),
                                Text(
                                  'Perfil',
                                  style: TextStyle(
                                    color: (currentIndex == 3)
                                        ? AppColors.primaryPink // Texto activo rosado
                                        : Colors.grey[500],
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
  // Contenido para la pestaña de Inicio
  Widget _homeContent(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Bienvenida fija
          Center(
            child: Text(
              '¡Bienvenid@ a Ale Beauty Art!',
              style: AppTextStyles.title.copyWith(fontSize: 24),
              textAlign: TextAlign.center,
            ),
          ),

          const SizedBox(height: 60), // espacio después de bienvenida

          // Carrusel de productos
          ProductCarousel(
            imageUrls: [
              'https://www.shutterstock.com/image-vector/makeup-products-realistic-vector-illustration-260nw-2220636093.jpg',
              'https://www.shutterstock.com/image-photo/makeup-professional-cosmetics-on-pink-600nw-1398700589.jpg',
              'https://st2.depositphotos.com/1026029/9075/i/450/depositphotos_90754482-stock-photo-cosmetics-set-for-make-up.jpg',
              'https://st1.uvnimg.com/dims4/default/5d6bda0/2147483647/thumbnail/1024x576/quality/75/?url=https%3A%2F%2Fuvn-brightspot.s3.amazonaws.com%2Fassets%2Fvixes%2Fp%2Fproductos-de-maquillaje-look.jpg',
            ],
          ),

          const SizedBox(height: 80), // espacio entre carrusel y sección destacada
  
          // Título sección productos destacados
          Text(
            'Productos Destacados',
            style: AppTextStyles.title.copyWith(fontSize: 20),
          ),
          const SizedBox(height: 20), // Espacio para donde irán los productos luego
          SizedBox(
            height: 180,
            child: ProductsCarousel(),
          ),
        ],
      ),
    );
  }
}



