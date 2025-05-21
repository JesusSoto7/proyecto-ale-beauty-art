import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => HomeBloc(),
      child: MaterialApp(
        home: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
           if (state is HomeLoadFailure) {
              return FailureView();
            }
            return InitialView();
          },
        ),
      ),
    );
  }
}

// return MultiBlocProvider(
//   providers: [
//     BlocProvider(create: (_) => HomeBloc()),
//     BlocProvider(create: (_) => ProductBloc()), // tu bloc para productos
//   ],
//   child: MaterialApp(
//     home: BlocBuilder<HomeBloc, HomeState>(
//       builder: (context, state) {
//         if (state is HomeLoadFailure) {
//           return FailureView();
//         }
//         // Aquí podrías usar ProductBloc para mostrar ProductsPage
//         return BlocBuilder<ProductBloc, ProductState>(
//           builder: (context, productState) {
//             if (productState is ProductLoadInProgress) {
//               return LoadingView();
//             } else if (productState is ProductLoadFailure) {
//               return FailureView();
//             } else if (productState is ProductLoadSuccess) {
//               return ProductsPage(products: productState.products);
//             }
//             return InitialView();
//           },
//         );
//       },
//     ),
//   ),
// );