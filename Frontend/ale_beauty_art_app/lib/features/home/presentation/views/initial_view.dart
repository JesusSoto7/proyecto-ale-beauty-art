import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';

import 'package:ale_beauty_art_app/styles/colors.dart'; // Estilos
import 'package:ale_beauty_art_app/styles/text_styles.dart'; // Tipografías

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  'assets/images/ale_logo.jpg',
                  height: 40,
                  width: 40,
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
                  return const Center(child: Text('Perfil (próximamente)')); // Vista perfil
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
              selectedItemColor: AppColors.primaryPink,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Inicio'),
                BottomNavigationBarItem(icon: Icon(Icons.list), label: 'Productos'),
                BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
              ],
            );
          },
        ),
      ),
    );
  }

  // Contenido para la pestaña de Inicio
  Widget _homeContent(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '¡Bienvenid@ a Ale Beauty Art!',
              style: AppTextStyles.title.copyWith(fontSize: 24),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
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
          ],
        ),
      ),
    );
  }
}




