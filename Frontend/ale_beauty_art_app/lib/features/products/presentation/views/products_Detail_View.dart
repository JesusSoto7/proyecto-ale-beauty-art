import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:ale_beauty_art_app/features/checkout/presentation/view/checkout_page.dart';
import 'package:ale_beauty_art_app/features/checkout/shippingAddress/select_address_Page.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';

class ProductDetailView extends StatefulWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  bool _isImageLoaded = false;

  void _markImageLoaded() {
    if (!_isImageLoaded && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) setState(() => _isImageLoaded = true);
      });
    }
  }

  @override
  void initState() {
    super.initState();
    // Ya no disparamos eventos al ProductBloc; usamos el producto recibido
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    // Hacer la imagen de cabecera más larga hacia abajo (aprox. 60% de alto de pantalla)
    final double headerHeight = MediaQuery.of(context).size.height * 0.6;
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            pinned: true,
            expandedHeight: headerHeight,
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                color: Colors.white,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              // Favorito vuelve a la esquina superior derecha del AppBar (estilo botón circular)
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: _FavoriteButton(
                  productId: product.id,
                  compact: true,
                  circularBackground: true,
                ),
              ),
            ],
            centerTitle: true,
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.pin,
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Imagen con curvas inferiores
                  Align(
                    alignment: Alignment.topCenter,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(28),
                        bottomRight: Radius.circular(28),
                      ),
                      child: (product.imagenUrl != null &&
                              product.imagenUrl!.isNotEmpty)
                          ? Stack(
                              children: [
                                Positioned.fill(
                                  child: Image.network(
                                    product.imagenUrl!,
                                    fit: BoxFit.cover,
                                    frameBuilder: (context, child, frame,
                                        wasSynchronouslyLoaded) {
                                      if (wasSynchronouslyLoaded) {
                                        _markImageLoaded();
                                        return child;
                                      }
                                      if (frame == null) {
                                        return const SizedBox.shrink();
                                      } else {
                                        _markImageLoaded();
                                        return child;
                                      }
                                    },
                                    errorBuilder: (context, error, stack) {
                                      _markImageLoaded();
                                      return const Center(
                                        child: Text(
                                          '💋',
                                          style: TextStyle(
                                            fontSize: 64,
                                            color: AppColors.primaryPink,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                if (!_isImageLoaded)
                                  Positioned.fill(
                                    child: Shimmer.fromColors(
                                      baseColor: Colors.grey.shade300,
                                      highlightColor: Colors.grey.shade100,
                                      child: Container(
                                        color: Colors.grey.shade300,
                                      ),
                                    ),
                                  ),
                              ],
                            )
                          : const Center(
                              child: Text(
                                '💋',
                                style: TextStyle(
                                  fontSize: 64,
                                  color: AppColors.primaryPink,
                                ),
                              ),
                            ),
                    ),
                  ),
                  // Eliminado el botón flotante de favorito (ahora está en el AppBar)
                  // Degradado sutil arriba para que la flecha sea visible
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    child: IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withOpacity(0.35),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            systemOverlayStyle: SystemUiOverlayStyle.light,
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Información sin contenedor (estilo limpio)
                  // Badge de categoría arriba, pequeño
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEEF3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      product.nombreCategoria,
                      style: const TextStyle(
                        color: Color(0xFFD95D85),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          product.nombreProducto,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        formatPriceCOP(product.precioProducto),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFD95D85),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Text(
                    product.descripcion,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Color(0xFF374151),
                      height: 1.55,
                    ),
                  ),
                  const SizedBox(height: 64),
                ],
              ),
            ),
          ),
        ],
      ),

      // Botones
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
        child: LayoutBuilder(
          builder: (context, constraints) {
            // Siempre mostrar los dos botones lado a lado. Ajustar estilo si el ancho es reducido.
            final double totalWidth = constraints.maxWidth;
            final double gap = 12;
            final double perButton = (totalWidth - gap) / 2;
            final bool dense = perButton < 160; // umbral para activar modo compacto

            final addButton = _buildPillButton(
              icon: Icons.add_shopping_cart,
              label: 'product_detail.add'.tr(),
              tooltip: 'product_detail.add_tooltip'.tr(),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
              ),
              dense: dense,
              onTap: () async {
                  final authState = context.read<AuthBloc>().state;

                  if (authState is! AuthSuccess) {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => const LoginPage()),
                    );

                    if (result == true) {
                      final auth =
                          context.read<AuthBloc>().state as AuthSuccess;

                      context
                          .read<CartBloc>()
                          .add(UpdateCartToken(auth.token));

                      // Agregar producto
                      context.read<CartBloc>().add(
                            AddProductToCart(productId: product.id),
                          );

                      // Recargar carrito para que se vea reflejado
                      context.read<CartBloc>().add(LoadCart());
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'product_detail.added_snackbar'.tr(),
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold),
                          ),
                              backgroundColor: const Color(0xFFD95D85),
                          behavior: SnackBarBehavior.floating,
                          margin: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                          elevation: 6,
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    } else {
                      return; // Canceló login
                    }
                  } else {
                    final auth = authState;
                    context
                        .read<CartBloc>()
                        .add(UpdateCartToken(auth.token));
                    context.read<CartBloc>().add(
                          AddProductToCart(productId: product.id),
                        );
                    context.read<CartBloc>().add(LoadCart());

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'product_detail.added_snackbar'.tr(),
                          style: const TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                            backgroundColor: const Color(0xFFD95D85),
                        behavior: SnackBarBehavior.floating,
                        margin: const EdgeInsets.fromLTRB(20, 0, 20, 30),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                        elevation: 6,
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  }
              },
            );
            final buyButton = _buildPillButton(
              icon: Icons.attach_money_rounded,
              label: 'product_detail.buy'.tr(),
              tooltip: 'product_detail.buy_tooltip'.tr(),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
              ),
              dense: dense,
              onTap: () async {
                // Quick Buy: pide login si no hay sesión, luego selecciona dirección y crea checkout con SOLO este producto
                final authState = context.read<AuthBloc>().state;

                Future<void> proceedWithToken(String token) async {
                  // 1) Seleccionar dirección de envío
                  final selectedAddressId = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SelectAddressPage(
                        onContinue: (addressId) {
                          Navigator.pop(context, addressId);
                        },
                      ),
                    ),
                  );

                  if (selectedAddressId == null) return; // cancelado

                  // 2) Calcular total SOLO para este producto (con descuento si aplica) + envío
                  final double unitPrice =
                      (product.precioConMejorDescuento ?? product.precioProducto)
                          .toDouble();
                  const double shippingCost = 10000;
                  final double total = unitPrice + shippingCost;

                  // 3) Ir a CheckoutPage pasando una lista con un solo producto
                  final oneItemProducts = [
                    {
                      'product_id': product.id,
                      'quantity': 1,
                    }
                  ];

                  // Nota: CheckoutPage se encarga de crear la orden y redirigir a PaymentPage
                  //       usando el token y la dirección seleccionada.
                  if (!mounted) return;
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CheckoutPage(
                        cartProducts: oneItemProducts,
                        cartTotal: total,
                        token: token,
                        selectedAddressId: selectedAddressId,
                        restoreCartAfterPayment: true,
                      ),
                    ),
                  );
                }

                if (authState is! AuthSuccess) {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginPage()),
                  );
                  if (result == true && mounted) {
                    final auth = context.read<AuthBloc>().state as AuthSuccess;
                    await proceedWithToken(auth.token);
                  }
                } else {
                  await proceedWithToken(authState.token);
                }
              },
            );

            return Row(
              children: [
                Expanded(child: addButton),
                const SizedBox(width: 12),
                Expanded(child: buyButton),
              ],
            );
          },
        ),
      ),
    );
  }
}

extension on _ProductDetailViewState {
  Widget _buildPillButton({
    required IconData icon,
    required String label,
    required LinearGradient gradient,
    required VoidCallback onTap,
    bool dense = false,
    String? tooltip,
  }) {
    final double verticalPad = dense ? 10 : 14;
    final double horizontalPad = dense ? 14 : 20;
    final double fontSize = dense ? 14 : 15;
    final double iconSize = dense ? 20 : 22;
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD95D85).withOpacity(0.25),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(26),
          onTap: onTap,
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: verticalPad, horizontal: horizontalPad),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white, size: iconSize),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: fontSize,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

}

class _FavoriteButton extends StatefulWidget {
  final int productId;
  final bool compact; // reduce padding/size for AppBar
  final bool circularBackground; // render white circular bg with shadow
  const _FavoriteButton({
    required this.productId,
    this.compact = false,
    this.circularBackground = false,
  });

  @override
  State<_FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<_FavoriteButton> {
  bool _busy = false;
  
  @override
  void initState() {
    super.initState();
    // Intentar sincronizar favoritos al entrar, si hay sesión
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthSuccess) {
      context.read<FavoriteBloc>().add(UpdateFavoriteToken(authState.token));
      // Cargar favoritos (idempotente en cada pantalla)
      context.read<FavoriteBloc>().add(LoadFavorites());
    }
  }

  Future<void> _toggle(bool isFavNow) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is! AuthSuccess) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginPage()),
        );
        if (result != true) {
          setState(() => _busy = false);
          return;
        }
      }

      final auth = context.read<AuthBloc>().state as AuthSuccess;

      // Asegurar que FavoriteBloc tenga el token actualizado
      context.read<FavoriteBloc>().add(UpdateFavoriteToken(auth.token));

      if (isFavNow) {
        context.read<FavoriteBloc>().add(RemoveFavorite(widget.productId));
      } else {
        context.read<FavoriteBloc>().add(AddFavorite(widget.productId));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FavoriteBloc, FavoriteState>(
      builder: (context, state) {
        bool isFav = false;
        if (state is FavoriteSuccess) {
          isFav = state.favorites.any((f) => f.id == widget.productId);
        }
        final iconWidget = _busy
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(
                isFav ? Icons.favorite : Icons.favorite_border,
                color: isFav ? const Color(0xFFD95D85) : Colors.grey,
              );

        final btn = IconButton(
          icon: iconWidget,
          onPressed: () => _toggle(isFav),
          tooltip: isFav
              ? 'product_detail.favorite_remove'.tr()
              : 'product_detail.favorite_add'.tr(),
          padding: widget.compact ? EdgeInsets.zero : null,
          constraints: widget.compact
              ? const BoxConstraints.tightFor(width: 28, height: 28)
              : null,
          splashRadius: widget.compact ? 20 : null,
        );

        if (widget.circularBackground) {
          return Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Center(child: btn),
          );
        }

        return btn;
      },
    );
  }
}
