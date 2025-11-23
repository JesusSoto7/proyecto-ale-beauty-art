import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/categories/presentation/bloc/categories_bloc.dart';
import 'package:ale_beauty_art_app/features/chat_ia/bloc/chat_ia_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/bloc/payment_bloc.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';
import 'package:ale_beauty_art_app/features/navigation/bloc/navigation_bloc.dart';
import 'package:ale_beauty_art_app/features/notifications/presentation/bloc/notification_bloc.dart';
import 'package:ale_beauty_art_app/features/orders/presentation/bloc/order_bloc.dart';
import 'package:ale_beauty_art_app/features/profile/presentation/bloc/profile_bloc.dart';
import 'package:ale_beauty_art_app/features/shipping_address/presentation/bloc/shipping_address_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:io' show Platform;
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/bloc/home_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/home/presentation/views/initial_view.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:easy_localization/easy_localization.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await EasyLocalization.ensureInitialized();
  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('es')],
      path: 'assets/translations',
      fallbackLocale: const Locale('es'),
      saveLocale: true,
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Ensure system navigation bar matches the app bottom nav across the whole app (Android).
    // Call after first frame to avoid being overridden by other widgets that run during build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (Platform.isAndroid) {
        // Draw edge-to-edge and set nav bar to a light grey so the system
        // navigation buttons don't appear fully white on devices using button
        // navigation. Also disable contrast enforcement on Android 15+.
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
        SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
          // Use a slightly darker gray so system navigation icons appear more 'gray' visually
          systemNavigationBarColor: Color(0xFFE0E0E0),
          systemNavigationBarIconBrightness: Brightness.dark,
          systemNavigationBarDividerColor: Color(0xFFE0E0E0),
          systemNavigationBarContrastEnforced: false,
        ));
      } else {
        SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
          systemNavigationBarColor: Colors.white,
          systemNavigationBarIconBrightness: Brightness.dark,
          systemNavigationBarDividerColor: Colors.white,
        ));
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      // Reapply system UI style when the app resumes (some OEMs may reset it).
      if (Platform.isAndroid) {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
        SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
          systemNavigationBarColor: Color(0xFFE0E0E0),
          systemNavigationBarIconBrightness: Brightness.dark,
          systemNavigationBarDividerColor: Color(0xFFE0E0E0),
          systemNavigationBarContrastEnforced: false,
        ));
      } else {
        SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
          systemNavigationBarColor: Colors.white,
          systemNavigationBarIconBrightness: Brightness.dark,
          systemNavigationBarDividerColor: Colors.white,
        ));
      }
    }
  }

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
        BlocProvider(
          create: (context) {
            final authState = context.read<AuthBloc>().state;
            final token = authState is AuthSuccess ? authState.token : "";
            final apiUrl = dotenv.env['API_BASE_URL']! + "/api/v1";
            return FavoriteBloc(apiUrl: apiUrl, jwtToken: token);
          },
        ),
        BlocProvider(create: (context) => ChatIaBloc()),
        BlocProvider(
          create: (context) => NotificationBloc(),
        ),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        locale: context.locale,
        supportedLocales: context.supportedLocales,
        localizationsDelegates: context.localizationDelegates,
        title: 'app_name'.tr(),
        theme: ThemeData(
          // Ensure AppBars do not override the system navigation bar color
          appBarTheme: const AppBarTheme(
            systemOverlayStyle: SystemUiOverlayStyle(
              systemNavigationBarColor: Color(0xFFE0E0E0),
              systemNavigationBarIconBrightness: Brightness.dark,
              systemNavigationBarDividerColor: Color(0xFFE0E0E0),
            ),
          ),
        ),
        home: const InitialView(), // Solo muestra la vista inicial
        navigatorObservers: [_SystemUiNavigatorObserver()],
      ),
    );
  }

}

class _SystemUiNavigatorObserver extends NavigatorObserver {
  void _applyStyle() {
    if (Platform.isAndroid) {
      SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        systemNavigationBarColor: Color(0xFFE0E0E0),
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarDividerColor: Color(0xFFE0E0E0),
        systemNavigationBarContrastEnforced: false,
      ));
    } else {
      SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarDividerColor: Colors.white,
      ));
    }
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _applyStyle();
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    _applyStyle();
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    _applyStyle();
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
