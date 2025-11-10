// ignore_for_file: use_key_in_widget_constructors, prefer_const_constructors
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/chat_ia/widget/chat_ia_widget.dart';
import 'package:ale_beauty_art_app/features/home/presentation/widgets/notification_bell_icon.dart';
import 'package:ale_beauty_art_app/features/notifications/presentation/bloc/notification_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
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
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';
import '../widgets/buscador.dart';

class InitialView extends StatelessWidget {
  const InitialView({super.key});

  @override
  Widget build(BuildContext context) {
    // Depend on locale changes to rebuild this screen immediately when language switches
    final currentLocale = context.locale;
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthSuccess) {
      context.read<NotificationBloc>().add(
            UpdateNotificationToken(authState.token),
          );
      // Sincroniza también el token global de favoritos al iniciar
      final favBloc = context.read<FavoriteBloc>();
      favBloc.add(UpdateFavoriteToken(authState.token));
      final currentState = context.read<NotificationBloc>().state;
      if (currentState is NotificationInitial) {
        context.read<NotificationBloc>().add(NotificationFetched());
      }
    }

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
        child: Stack(children: [
          Scaffold(
            backgroundColor: Colors.transparent,
            body: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color.fromRGBO(209, 112, 143, 1),
                    Color.fromARGB(255, 245, 215, 227),
                  ],
                ),
              ),
              child: SafeArea(
                child: BlocBuilder<NavigationBloc, NavigationState>(
                  builder: (context, state) {
                    int index = 0;
                    if (state is NavigationUpdated) index = state.selectedIndex;

                    if (index == 1) return ProductsPageView();
                    if (index == 2) return CategoriesPageView();
                    if (index == 3) return CartPageView();
                    if (index == 4) return ProfileView();

                    return _homeContent(context);
                  },
                ),
              ),
            ),
            bottomNavigationBar: _buildBottomNav(context, currentLocale),
          ),
// Reemplaza el FloatingActionButton completo con esto:

          Positioned(
            bottom: 90,
            right: 24,
            child: FloatingActionButton(
              backgroundColor: Color(0xFFD95D85),
              child: Icon(Icons.chat, color: Colors.white),
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  builder: (context) => ChatIAWidget(),
                );
              },
            ),
          ),
        ]));
  }

  Widget _homeContent(BuildContext context) {
    final productBloc = context.read<ProductBloc>();
    if (productBloc.state is ProductInitial) {
      productBloc.add(ProductFetched());
    }

    final screenHeight = MediaQuery.of(context).size.height;

    return SingleChildScrollView(
      child: Column(
        children: [
          const SizedBox(height: 20),

          // 🔝 Header con icono de notificaciones
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
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
                // 🔔 Reemplaza el Container por el widget de notificaciones
                NotificationBellIcon(),
              ],
            ),
          ),

          const SizedBox(height: 25),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFFFEEF3),
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: ExpandableSearchBar(),
              ),
            ),
          ),

          const SizedBox(height: 25),

          const CategoriesRowView(),

          const SizedBox(height: 40),

          Container(
            width: double.infinity,
            constraints: BoxConstraints(
              minHeight: screenHeight * 0.6,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(40),
                topRight: Radius.circular(40),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionHeader("home.popular_products".tr(), () {}),
                  const SizedBox(height: 20),
                  const SizedBox(height: 280, child: ProductsCarousel()),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

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
            child: Text(
              'common.see_more'.tr(),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNav(BuildContext context, Locale locale) {
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
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          child: BlocBuilder<NavigationBloc, NavigationState>(
            builder: (context, navState) {
              final selectedIndex = navState is NavigationUpdated ? navState.selectedIndex : 0;

              // Mostrar texto solo en la pestaña seleccionada para evitar overflow en títulos largos.
              final labels = <String>[
                'nav.home'.tr(),
                'nav.products'.tr(),
                'nav.categories'.tr(),
                'nav.cart'.tr(),
                'nav.profile'.tr(),
              ];

              return GNav(
                gap: 6,
                iconSize: 22,
                backgroundColor: Colors.transparent,
                color: Colors.grey[600],
                activeColor: Colors.white,
                tabBackgroundGradient: const LinearGradient(
                  colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                onTabChange: (index) async {
                  if (index == 3) {
                    final previousIndex =
                        context.read<NavigationBloc>().state is NavigationUpdated
                            ? (context.read<NavigationBloc>().state as NavigationUpdated).selectedIndex
                            : 0;

                    await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CartPageView()),
                    );

                    context.read<NavigationBloc>().add(NavigationTabChanged(previousIndex));
                  } else {
                    context.read<NavigationBloc>().add(NavigationTabChanged(index));
                  }
                },
                tabs: [
                  GButton(icon: Icons.home_rounded, text: selectedIndex == 0 ? labels[0] : ''),
                  GButton(icon: Icons.grid_view_rounded, text: selectedIndex == 1 ? labels[1] : ''),
                  GButton(icon: Icons.category_rounded, text: selectedIndex == 2 ? labels[2] : ''),
                  GButton(icon: Icons.shopping_cart_rounded, text: selectedIndex == 3 ? labels[3] : ''),
                  GButton(icon: Icons.person, text: selectedIndex == 4 ? labels[4] : ''),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

// 🔔 Widget del icono de notificaciones con badge
