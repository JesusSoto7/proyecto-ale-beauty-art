import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/view/cart_page_view.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/bloc/categories_bloc.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/views/categories_page_view.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/views/categories_row.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/products_carousel.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/views/profile_view.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:ale_beauty_art_app/styles/colors.dart'; // Estilos
import 'package:ale_beauty_art_app/styles/text_styles.dart'; // Tipografías

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../widgets/carousel_widget.dart';

import '../widgets/buscador.dart';

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
        backgroundColor: const Color.fromARGB(255, 247, 246, 246),
        // AppBar con logo y barra de búsqueda
        appBar: AppBar(
          backgroundColor: const Color.fromARGB(255, 255, 238, 243),
          automaticallyImplyLeading: false,
          elevation: 0,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo
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
              
              // Barra de búsqueda
              const ExpandableSearchBar(),
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
                    return const CartPageView(); // 🛒 Carrito como vista
                  case 4:
                    return const ProfileView();
                  default:
                    return _homeContent(context);
                }
              } else {
                return _homeContent(context);
              }
            },
          ),
          resizeToAvoidBottomInset: false,
          
          // 🔥 Nuevo Navbar con GNav
          bottomNavigationBar: BlocBuilder<NavigationBloc, NavigationState>(
            builder: (context, state) {
              context.read<ProductBloc>().add(ProductFetched());
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      blurRadius: 8,
                      color: Colors.black.withOpacity(0.1),
                    )
                  ],
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                    child: GNav(
                      gap: 8,
                      backgroundColor: Colors.white,
                      color: Colors.grey[500],
                      activeColor: AppColors.primaryPink,
                      tabBackgroundColor: AppColors.primaryPink.withOpacity(0.1),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      //cambiar mas adelante mejorar los tabs visuales
                      onTabChange: (index) async {
                        if (index == 3) {
                          final previousIndex = context.read<NavigationBloc>().state is NavigationUpdated
                              ? (context.read<NavigationBloc>().state as NavigationUpdated).selectedIndex
                              : 0;

                          final authState = context.read<AuthBloc>().state;

                          if (authState is! AuthSuccess) {
                            // No logueado → ir a login
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const LoginPage()),
                            );

                            if (result != true) {
                              // Canceló login → volvemos al tab anterior
                              context.read<NavigationBloc>().add(NavigationTabChanged(previousIndex));
                              return;
                            }
                          }

                          // ✅ Logueado
                          final auth = context.read<AuthBloc>().state as AuthSuccess;
                          context.read<CartBloc>().add(UpdateCartToken(auth.token));
                          context.read<CartBloc>().add(LoadCart());

                          // Cambiar el tab visual a Carrito mientras se abre la vista
                          context.read<NavigationBloc>().add(NavigationTabChanged(3));

                          // Abrir carrito como vista superpuesta
                          await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CartPageView()),
                          );

                          // Al cerrar carrito → restaurar tab anterior
                          context.read<NavigationBloc>().add(NavigationTabChanged(previousIndex));

                        } else {
                          // Tabs normales
                          context.read<NavigationBloc>().add(NavigationTabChanged(index));
                          if (index == 1) context.read<ProductBloc>().add(ProductFetched());
                          if (index == 2) context.read<CategoriesBloc>().add(CategoriesFetched());
                        }
                      },


                      tabs: [
                        GButton(icon: Icons.home_rounded, text: 'Inicio'),
                        GButton(icon: Icons.grid_view_rounded, text: 'Productos'),
                        GButton(icon: Icons.category_rounded, text: 'Categorías'),
                        GButton(icon: Icons.shopping_cart_rounded, text: 'Carrito'),
                        GButton(icon: Icons.person, text: 'Perfil'),
                      ],
                    ),
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

          // Carrusel de productos
          ProductCarousel(
            imageUrls: [
              'https://www.shutterstock.com/image-vector/makeup-products-realistic-vector-illustration-260nw-2220636093.jpg',
              'https://www.shutterstock.com/image-photo/makeup-professional-cosmetics-on-pink-600nw-1398700589.jpg',
              'https://st2.depositphotos.com/1026029/9075/i/450/depositphotos_90754482-stock-photo-cosmetics-set-for-make-up.jpg',
              'https://st1.uvnimg.com/dims4/default/5d6bda0/2147483647/thumbnail/1024x576/quality/75/?url=https%3A%2F%2Fuvn-brightspot.s3.amazonaws.com%2Fassets%2Fvixes%2Fp%2Fproductos-de-maquillaje-look.jpg',
            ],
          ),

          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Categorias',
                style: AppTextStyles.title.copyWith(fontSize: 20),
              ),
              GestureDetector(
                onTap: () {
                  context.read<NavigationBloc>().add(NavigationTabChanged(2));
                },
                child: Text('Ver Más', style: AppTextStyles.subtitle),
              ),
            ],
          ),
          const SizedBox(height: 20),
          CategoriesRowView(),
          const SizedBox(height: 20), // espacio entre carrusel y sección destacada
        
          // Título sección productos destacados
          Text(
            'Productos Destacados',
            style: AppTextStyles.title.copyWith(fontSize: 20),
          ),
          const SizedBox(height: 20), // Espacio para donde irán los productos luego
          SizedBox(
            height: 210,
            child: ProductsCarousel(),
          ),
        ],
      ),
    );
  }
}

