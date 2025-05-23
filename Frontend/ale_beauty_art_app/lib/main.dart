import 'package:ale_beauty_art_app/core/views/failure_view.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_page_view.dart';

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
        debugShowCheckedModeBanner: false,
        home: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
            if (state is HomeInitial) {
              return InitialView();
            } else if (state is HomeShowProducts) {
              return BlocProvider(
                create: (_) => ProductBloc()..add(ProductFetched()),
                child: ProductsPageView(),
              );
            } else {
              return FailureView();
            }
          },
        ),
      ),
    );
  }
}