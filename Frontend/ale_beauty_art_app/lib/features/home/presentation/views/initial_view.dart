
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';
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
      // Esta función evita que el usuario cierre la app si no hay nada más en la pila
      onWillPop: () async {
        final canPop = Navigator.of(context).canPop();
        return !canPop; // Solo permite salir si no hay nada en la pila
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        
        // AppBar con logo y barra de búsqueda
        appBar: AppBar(
          backgroundColor: AppColors.primaryPink,
          automaticallyImplyLeading: false, // Evita que aparezca flecha de regreso
          elevation: 0,
          title: Row(
            children: [
              // Logo redondeado a la izquierda
              ClipRRect(
                child: Image.asset(
                  'assets/images/ale_logo.png',
                  height: 55,
                  width: 55,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 12),

              // Barra de búsqueda
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

        // Contenido principal controlado por NavigationBloc
        body: BlocBuilder<NavigationBloc, NavigationState>(
          builder: (context, state) {
            if (state is NavigationUpdated) {
              switch (state.selectedIndex) {
                case 0:
                  return _homeContent(context); // Vista principal
                case 1:
                  return const ProductsPageView(); // Vista de productos
                case 2:
                  return const ProfileView();  // Vista perfil
                case 3:
                  return const ProfileView();  // Vista categorias
                default:
                  return _homeContent(context); // Fallback
              }
            } else {
              return _homeContent(context); // Fallback en caso de otro estado
            }
          },
        ),

        // Barra de navegación inferior
        bottomNavigationBar: BlocBuilder<NavigationBloc, NavigationState>(
          builder: (context, state) {
            final currentIndex = (state is NavigationUpdated) ? state.selectedIndex : 0;

            return BottomNavigationBar(
              currentIndex: currentIndex,
              onTap: (index) {
                context.read<NavigationBloc>().add(NavigationTabChanged(index));

                // Cargar productos si se navega a la pestaña de productos
                if (index == 1) {
                  context.read<ProductBloc>().add(ProductFetched());
                }
              },
              
              type: BottomNavigationBarType.fixed,
              backgroundColor: Colors.white,
              selectedItemColor: AppColors.primaryPink,
              unselectedItemColor: Colors.grey[400],
              selectedFontSize: 12,
              unselectedFontSize: 12,
              elevation: 0,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_rounded),
                  activeIcon: Icon(Icons.home),
                  label: 'Inicio',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.grid_view_rounded),
                  activeIcon: Icon(Icons.grid_view),
                  label: 'Productos',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline_rounded),
                  activeIcon: Icon(Icons.person),
                  label: 'Perfil',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.spa),
                  activeIcon: Icon(Icons.spa_outlined),
                  label: 'Categorías',
                ),
              ],
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

        // Aquí irán los productos destacados (por ahora en blanco)
        Container(
          height: 150, // puedes ajustarlo o eliminarlo luego
          color: Colors.transparent,
        ),
      ],
    ),
  );
}

}

     // ElevatedButton(
            //   style: ElevatedButton.styleFrom(
            //     backgroundColor: AppColors.accentPink,
            //     padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
            //     shape: RoundedRectangleBorder(
            //       borderRadius: BorderRadius.circular(20),
            //     ),
            //   ),
            //   onPressed: () {
            //     // Al presionar "Ver Productos", cargamos productos y cambiamos de vista
            //     context.read<ProductBloc>().add(ProductFetched());
            //     context.read<NavigationBloc>().add(const NavigationTabChanged(1));
            //   },
            //   child: const Text(
            //     'Ver Productos',
            //     style: TextStyle(color: AppColors.buttonText, fontSize: 16),
            //   ),
            // ),



