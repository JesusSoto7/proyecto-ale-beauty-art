import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/view/cart_page_view.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/views/categories_page_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/views/profile_view.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/views/categories_row.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/products_carousel.dart';
import '../widgets/buscador.dart';

class InitialView extends StatelessWidget {
  const InitialView({super.key});

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        final navBloc = context.read<NavigationBloc>();
        final navState = navBloc.state;
        int currentTab = 0;
        if (navState is NavigationUpdated) {
          currentTab = navState.selectedIndex;
        }
        if (currentTab != 0) {
          navBloc.add(NavigationTabChanged(0));
          return false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Stack(
          children: [
            // Fondo degradado superior
            Container(
              height: 310,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color.fromRGBO(209, 112, 143, 1),
                    Color.fromARGB(255, 245, 215, 227),
                  ],
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(40),
                  bottomRight: Radius.circular(40),
                ),
              ),
            ),

            // Contenido principal
            SafeArea(
              child: BlocBuilder<NavigationBloc, NavigationState>(
                builder: (context, state) {
                  int index = 0;
                  if (state is NavigationUpdated) index = state.selectedIndex;

                  if (index == 1) return const ProductsPageView();
                  if (index == 2) return const CategoriesPageView();
                  if (index == 3) return const CartPageView();
                  if (index == 4) return const ProfileView();

                  return _homeContent(context);
                },
              ),
            ),
          ],
        ),
        bottomNavigationBar: _buildBottomNav(context),
      ),
    );
  }

  // 🌷 Contenido principal (Home)
  Widget _homeContent(BuildContext context) {
    // Lanzar ProductFetched SOLO si es necesario
    final productBloc = context.read<ProductBloc>();
    if (productBloc.state is ProductInitial) {
      productBloc.add(ProductFetched());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 20, left: 20, right: 20, bottom: 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🔝 Encabezado superior: Menú, LOGO, Notificación
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Icon(Icons.menu, color: Colors.white, size: 28),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(
                  'assets/images/ale_logo.png',
                  height: 42,
                  width: 42,
                  fit: BoxFit.cover,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.notifications_none_rounded,
                  color: Color(0xFFD95D85),
                ),
              ),
            ],
          ),

          const SizedBox(height: 25),

          // 🔍 Buscador
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFFFEEF3),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                )
              ],
            ),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: ExpandableSearchBar(),
            ),
          ),

          const SizedBox(height: 25),

          // 🔼 Categorías
          const CategoriesRowView(),

          // Más separación antes de los productos populares
          const SizedBox(height: 80),

          // 🛍 Productos populares
          _sectionHeader("Productos populares", () {}),
          const SizedBox(height: 20),
          SizedBox(height: 230, child: ProductsCarousel()),
        ],
      ),
    );
  }

  // Encabezado de sección (Productos populares)
  Widget _sectionHeader(String title, VoidCallback onTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: AppTextStyles.title.copyWith(
            fontSize: 20,
            color: Colors.black87,
          ),
        ),
        GestureDetector(
          onTap: onTap,
          child: ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
            ).createShader(bounds),
            child: const Text(
              'Ver más',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }

  // 🌈 Barra de navegación inferior
  Widget _buildBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(25),
          topRight: Radius.circular(25),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
          child: GNav(
            gap: 8,
            backgroundColor: Colors.transparent,
            color: Colors.grey[500],
            activeColor: const Color.fromRGBO(255, 255, 255, 1),
            tabBackgroundGradient: const LinearGradient(
              colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            onTabChange: (index) async {
              if (index == 3) {
                final previousIndex =
                    context.read<NavigationBloc>().state is NavigationUpdated
                        ? (context.read<NavigationBloc>().state
                                as NavigationUpdated)
                            .selectedIndex
                        : 0;

                // Puedes agregar aquí lógica de autenticación si lo necesitas.
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CartPageView()),
                );

                // Al volver, regresa al tab anterior (por ejemplo, home)
                context
                    .read<NavigationBloc>()
                    .add(NavigationTabChanged(previousIndex));
              } else {
                context.read<NavigationBloc>().add(NavigationTabChanged(index));
              }
            },
            tabs: const [
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
  }
}
