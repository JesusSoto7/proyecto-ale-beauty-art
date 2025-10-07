import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/bloc/categories_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/bloc/payment_bloc.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/bloc/order_bloc.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/bloc/profile_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    //MULTIPLES BLOCS
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => HomeBloc()),
        BlocProvider(create: (_) => ProductBloc()),
        BlocProvider(create: (_) => CategoriesBloc()),
        BlocProvider(create: (_) => NavigationBloc()),
        BlocProvider(create: (_) => ProfileBloc()),
        BlocProvider(create: (_) => AuthBloc()),
        BlocProvider(create: (_) => CartBloc()),
        BlocProvider(create: (_) => ShippingAddressBloc()),
        BlocProvider(create: (_) => OrderBloc()),
        BlocProvider(
          create: (context) {
            final authState = context.read<AuthBloc>().state;
            final token = authState is AuthSuccess ? authState.token : "";
            return PaymentBloc(token: token);
          },
        ),
      ],
      child: const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: InitialView(), // Solo muestra la vista inicial
      ),
    );
  }
}

//BLOC INDIVIDUAL
//     return BlocProvider(
//       create: (context) => HomeBloc(),
//       child: MaterialApp(
//         debugShowCheckedModeBanner: false,
//         home: BlocBuilder<HomeBloc, HomeState>(
//           builder: (context, state) {
//             if (state is HomeInitial) {
//               return InitialView();
//             } else if (state is HomeLoadInProgress){
//               return LoadingView();
//             } else if (state is HomeShowProducts) {
//               return BlocProvider(
//                 create: (_) => ProductBloc()..add(ProductFetched()),
//                 child: ProductsPageView(),
//               );
//             } else {
//               return FailureView();
//             }
//           },
//         ),
//       ),
//     );
