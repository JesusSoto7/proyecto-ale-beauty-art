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
import 'package:ale_beauty_art_app/features/products/presentation/widgets/favorite_toggle_button.dart';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'dart:convert';

class ProductDetailView extends StatefulWidget {
  final Product product;

  const ProductDetailView({super.key, required this.product});

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  bool _isImageLoaded = false;
  bool _loadingReviews = true;
  List<Map<String, dynamic>> _reviews = [];
  bool _relatedLoading = true;
  List<Product> _relatedProducts = [];
  bool _showReviewForm = false;
  bool _hasPurchased = false;
  bool _checkingPurchase = true;
  // Review submission state
  final TextEditingController _reviewController = TextEditingController();
  int _newRating = 5;
  bool _submittingReview = false;

  Future<void> _fetchReviews() async {
    setState(() => _loadingReviews = true);
    try {
      final res = await CustomHttpClient.getRequest(
        '/api/v1/products/${widget.product.id}/reviews',
        headers: const {'Content-Type': 'application/json'},
      );

      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        setState(() {
          _reviews = data.map((e) => e as Map<String, dynamic>).toList();
          _loadingReviews = false;
        });
      } else {
        setState(() {
          _reviews = [];
          _loadingReviews = false;
        });
      }
    } catch (e) {
      print('Error fetching reviews: $e');
      setState(() {
        _reviews = [];
        _loadingReviews = false;
      });
    }
  }

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
    // Cargar reseñas del backend
    _fetchReviews();
    _fetchRelatedProducts();
    // Verificar si el usuario compró este producto (para permitir reseñas)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkIfPurchased();
    });
  }

  Future<void> _checkIfPurchased() async {
    if (!mounted) return;
    setState(() => _checkingPurchase = true);

    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is! AuthSuccess) {
        if (mounted) setState(() {
          _hasPurchased = false;
          _checkingPurchase = false;
        });
        return;
      }

      final token = authState.token;
      final client = await CustomHttpClient.client;

      // Build identifier: prefer non-empty slug, otherwise use id
      final identifier = (widget.product.slug != null && widget.product.slug!.isNotEmpty)
          ? widget.product.slug!
          : widget.product.id.toString();

      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/products/$identifier/can_review');
      debugPrint('[can_review] GET $url');

      try {
        final resp = await client.get(url, headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        });
        debugPrint('[can_review] status=${resp.statusCode} body=${resp.body}');

        if (resp.statusCode == 200) {
          final body = jsonDecode(resp.body);
          bool purchased = false;
          if (body is Map<String, dynamic> && body.containsKey('can_review')) {
            final val = body['can_review'];
            purchased = (val == true) || (val?.toString() == 'true');
          }

          if (purchased) {
            if (mounted) setState(() {
              _hasPurchased = true;
              _checkingPurchase = false;
            });
            return;
          }

          // If server says false, attempt a fallback scan of user's orders to help diagnose
          debugPrint('[can_review] server returned false, attempting fallback /my_orders scan');
        } else {
          debugPrint('[can_review] non-200 response, attempting fallback /my_orders scan');
        }
      } catch (e) {
        debugPrint('[can_review] request error: $e');
      }

      // --- Fallback: fetch /my_orders and look for this product in paid orders ---
      try {
        final ordersUrl = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/my_orders');
        debugPrint('[my_orders] GET $ordersUrl');
        final orResp = await client.get(ordersUrl, headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        });
        debugPrint('[my_orders] status=${orResp.statusCode} body=${orResp.body}');

        if (orResp.statusCode == 200) {
          final jsonBody = jsonDecode(orResp.body);
          // jsonBody could be a list or a map with 'orders'
          List<dynamic> ordersList = [];
          if (jsonBody is List) ordersList = jsonBody;
          else if (jsonBody is Map<String, dynamic>) {
            if (jsonBody.containsKey('orders') && jsonBody['orders'] is List) ordersList = jsonBody['orders'];
            else if (jsonBody.containsKey('data') && jsonBody['data'] is List) ordersList = jsonBody['data'];
          }

          final prodId = widget.product.id;
          bool found = false;
          for (final o in ordersList) {
            if (o is Map<String, dynamic>) {
              final status = o['status'];
              // consider numeric 1 or string '1' or 'paid' as paid
              final paid = (status == 1) || (status?.toString() == '1') || (status?.toString().toLowerCase() == 'paid') || (status?.toString().toLowerCase() == 'completed');
              final details = o['order_details'] ?? o['orderDetails'] ?? o['items'] ?? o['products'];
              if (paid && details is List) {
                for (final d in details) {
                  if (d is Map<String, dynamic>) {
                    final pid = d['product_id'] ?? d['productId'] ?? d['id'] ?? d['product']?['id'];
                    if (pid != null && pid.toString() == prodId.toString()) {
                      found = true;
                      break;
                    }
                  }
                }
              }
            }
            if (found) break;
          }

          if (mounted) setState(() {
            _hasPurchased = found;
            _checkingPurchase = false;
          });
          return;
        }
      } catch (e) {
        debugPrint('[my_orders] request error: $e');
      }

      // Default: not purchased
      if (mounted) setState(() {
        _hasPurchased = false;
        _checkingPurchase = false;
      });
    } catch (e) {
      debugPrint('[checkIfPurchased] unexpected error: $e');
      if (mounted) setState(() {
        _hasPurchased = false;
        _checkingPurchase = false;
      });
    }
  }

  Future<void> _fetchRelatedProducts() async {
    setState(() => _relatedLoading = true);
    try {
      final res = await CustomHttpClient.getRequest(
        '/api/v1/products?sub_category_id=${widget.product.subCategoryId}',
        headers: const {'Content-Type': 'application/json'},
      );

      if (res.statusCode == 200) {
        final List<dynamic> data = jsonDecode(res.body);
        setState(() {
          _relatedProducts = data
              .map((e) => Product.fromJson(e as Map<String, dynamic>))
              .where((p) => p.id != widget.product.id)
              .toList();
          _relatedLoading = false;
        });
      } else {
        setState(() {
          _relatedProducts = [];
          _relatedLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching related products: $e');
      setState(() {
        _relatedProducts = [];
        _relatedLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_submittingReview) return;
    final authState = context.read<AuthBloc>().state;
    // If not logged in, ask to login first
    if (authState is! AuthSuccess) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
      if (result != true) return; // user cancelled
    }

    // Only allow review submission if we detected a purchase
    if (!_hasPurchased) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Debes comprar el producto para dejar una calificación')));
      return;
    }

    if (_reviewController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor escribe un comentario')));
      return;
    }

    setState(() => _submittingReview = true);
    try {
      final body = {
        'review': {
          'rating': _newRating,
          'comentario': _reviewController.text.trim(),
        }
      };

      final resp = await CustomHttpClient.postRequest(
        '/api/v1/products/${widget.product.id}/reviews',
        body,
        headers: {'Content-Type': 'application/json'},
      );

      if (resp.statusCode == 201 || resp.statusCode == 200) {
        // Refrescar reseñas
        _reviewController.clear();
        await _fetchReviews();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Calificación enviada')));
      } else if (resp.statusCode == 401) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Debes iniciar sesión para dejar una calificación')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error enviando calificación: ${resp.body}')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error de red: $e')));
    } finally {
      if (mounted) setState(() => _submittingReview = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final int _reviewCount = _reviews.length;
    final double _averageRating = _reviewCount > 0
        ? (_reviews.map((r) => (r['rating'] as num).toDouble()).reduce((a, b) => a + b) / _reviewCount)
        : 0.0;
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
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarIconBrightness: Brightness.dark,
              statusBarBrightness: Brightness.light,
            ),
          ),
          // Single vertical scroll: Details -> Related -> Reviews
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category / Subcategory badge (e.g. Labiales/Rojos)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEEF3),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${product.nombreCategoria}/${product.nombreSubCategoria}',
                      style: const TextStyle(
                        color: Color(0xFFD95D85),
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
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
                      // Price area: show discount badge + crossed original price when applicable
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          if (product.tieneDescuento) 
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  formatPriceCOP(product.precioProducto),
                                  style: TextStyle(
                                    color: Colors.grey[500],
                                    fontSize: 13,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: [Color.fromARGB(255, 197, 78, 118), Color.fromARGB(255, 218, 55, 106)]),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text('-${product.porcentajeDescuento}%', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),

                          const SizedBox(height: 4),

                          Text(
                            formatPriceCOP(product.precioConMejorDescuento ?? product.precioProducto),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFD95D85),
                            ),
                          ),
                        ],
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
                  const SizedBox(height: 28),

                  // Related products (fetched by subcategory)
                  Text('product_detail.related_products'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 18),
                  // Hacer los productos relacionados un poco más grandes y flexibles para evitar overflow
                  SizedBox(
                    height: 190,
                    child: _relatedLoading
                        ? ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemBuilder: (context, index) => Container(
                              width: 150,
                              height: 190,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 6)],
                              ),
                              child: Shimmer.fromColors(
                                baseColor: Colors.grey.shade300,
                                highlightColor: Colors.grey.shade100,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Imagen (skeleton)
                                    Container(
                                      height: 120,
                                      width: double.infinity,
                                      decoration: const BoxDecoration(
                                        borderRadius: BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                                      ),
                                      child: Container(color: Colors.grey[300]),
                                    ),
                                    // Texto: título (2 líneas aprox.)
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(10, 8, 10, 0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(height: 14, width: 110, color: Colors.grey[300]),
                                          const SizedBox(height: 6),
                                          Container(height: 12, width: 70, color: Colors.grey[300]),
                                        ],
                                      ),
                                    ),
                                    const Spacer(),
                                    // Precio (skeleton)
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
                                      child: Container(height: 14, width: 60, color: Colors.grey[300]),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            separatorBuilder: (_, __) => const SizedBox(width: 12),
                            itemCount: 3,
                          )
                        : LayoutBuilder(
                            builder: (context, constraints) {
                              // Use available width to choose a card size that adapts to small screens.
                              final screenW = MediaQuery.of(context).size.width;
                              final bool narrow = screenW < 360;
                              // Increase vertical space on narrow screens so prices fit.
                              final itemWidth = narrow ? 160.0 : 150.0;
                              final itemHeight = narrow ? 260.0 : 210.0; // increased heights
                              final imageHeight = narrow ? 100.0 : 110.0; // slightly reduced image to free vertical space
                              return ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                scrollDirection: Axis.horizontal,
                                itemBuilder: (context, index) {
                                  final p = _relatedProducts[index];
                                  final img = p.subCategoryImagenUrl ?? p.imagenUrl;
                                  return Padding(
                                    padding: EdgeInsets.only(right: index == _relatedProducts.length - 1 ? 8 : 12),
                                    child: GestureDetector(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(builder: (_) => ProductDetailView(product: p)),
                                        );
                                      },
                                      child: Container(
                                        width: itemWidth,
                                        height: itemHeight,
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 6)],
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            // Image area
                                            Container(
                                              height: imageHeight,
                                              width: double.infinity,
                                              decoration: const BoxDecoration(
                                                borderRadius: BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                                              ),
                                              child: Stack(
                                                fit: StackFit.expand,
                                                children: [
                                                  ClipRRect(
                                                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                                                    child: img != null
                                                        ? Image.network(img, fit: BoxFit.cover)
                                                        : Container(
                                                            color: Colors.grey[100],
                                                            child: const Center(child: Icon(Icons.image, color: Colors.grey, size: 36)),
                                                          ),
                                                  ),
                                                  if (p.tieneDescuento)
                                                    Positioned(
                                                      top: 10,
                                                      left: 10,
                                                      child: Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                                        decoration: BoxDecoration(
                                                          gradient: const LinearGradient(colors: [Color.fromARGB(255, 197, 78, 118), Color.fromARGB(255, 218, 55, 106)]),
                                                          borderRadius: BorderRadius.circular(10),
                                                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 6, offset: const Offset(0, 2))],
                                                        ),
                                                        child: Text('-${p.porcentajeDescuento}%', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                                      ),
                                                    ),
                                                  Positioned(
                                                    top: 8,
                                                    right: 8,
                                                    child: Container(
                                                      decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 6)]),
                                                      child: FavoriteToggleButton(productId: p.id, size: 18),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            // Text area
                                            Padding(
                                              padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                                                child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  SizedBox(
                                                    width: itemWidth - 20,
                                                    child: Text(p.nombreProducto, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  if (p.tieneDescuento)
                                                    Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          formatPriceCOP(p.precioProducto),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                          style: TextStyle(
                                                            color: Colors.grey[500],
                                                            fontSize: 11,
                                                            decoration: TextDecoration.lineThrough,
                                                          ),
                                                        ),
                                                        const SizedBox(height: 2),
                                                        Text(
                                                          formatPriceCOP(p.precioConMejorDescuento ?? p.precioProducto),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                          style: const TextStyle(color: Color(0xFFD95D85), fontWeight: FontWeight.bold, fontSize: 14),
                                                        ),
                                                      ],
                                                    )
                                                  else
                                                    Text(formatPriceCOP(p.precioProducto), style: const TextStyle(color: Color(0xFFD95D85), fontWeight: FontWeight.bold, fontSize: 14)),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                                separatorBuilder: (_, __) => const SizedBox(width: 12),
                                itemCount: _relatedProducts.length,
                              );
                            },
                          ),
                  ),
                  const SizedBox(height: 12),
                  const SizedBox(height: 24),

                  // Calificaciones generales
                  const Divider(),
                  const SizedBox(height: 12),
                  Text('product_detail.ratings_summary'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Color(0xFFFFC107), size: 28),
                      const SizedBox(width: 8),
                      Text(
                        _averageRating.toStringAsFixed(1),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _reviewCount == 1
                            ? 'product_detail.reviews_count_one'.tr()
                            : 'product_detail.reviews_count'.tr(namedArgs: {'count': _reviewCount.toString()}),
                        style: const TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Rating summary (histogram) and gated review action
                  const SizedBox(height: 8),
                  Column(
                    children: List.generate(5, (i) {
                      final star = 5 - i;
                      final count = _reviews.where((r) => ((r['rating'] as num?)?.toInt() ?? 0) == star).length;
                      final ratio = _reviewCount > 0 ? count / _reviewCount : 0.0;
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          children: [
                            SizedBox(width: 28, child: Row(children: [Text('$star', style: const TextStyle(fontWeight: FontWeight.w600)), const SizedBox(width: 4), const Icon(Icons.star, size: 14, color: Color(0xFFFFC107)) ])),
                            const SizedBox(width: 8),
                            Expanded(
                              child: LinearProgressIndicator(
                                value: ratio,
                                minHeight: 10,
                                backgroundColor: Colors.grey.shade200,
                                valueColor: const AlwaysStoppedAnimation(Color(0xFFFFC107)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            SizedBox(width: 36, child: Text('$count', textAlign: TextAlign.right)),
                          ],
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 12),

                  // Calificar button + conditional form (only if user purchased)
                  if (_checkingPurchase)
                    const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 8.0), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator())))
                  else ...[
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: ElevatedButton(
                        onPressed: () async {
                          // If form is currently visible, act as "Cancelar" -> hide and reset
                          if (_showReviewForm) {
                            setState(() {
                              _showReviewForm = false;
                              _reviewController.clear();
                              _newRating = 5;
                            });
                            return;
                          }

                          // Otherwise act as activator: ensure login + purchase check
                          final authState = context.read<AuthBloc>().state;
                          if (authState is! AuthSuccess) {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const LoginPage()),
                            );
                            if (result != true) return;
                            // user logged in, re-check purchase
                            await _checkIfPurchased();
                          }

                          if (!_hasPurchased) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('product_detail.must_purchase_to_review'.tr())));
                            return;
                          }

                          setState(() => _showReviewForm = true);
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
                        child: Text(_showReviewForm ? 'common.cancel'.tr() : 'product_detail.rate'.tr(), style: const TextStyle(color: Colors.white)),
                      ),
                    ),

                    if (_showReviewForm) Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('product_detail.write_review_title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Row(
                              children: List.generate(5, (i) {
                                final idx = i + 1;
                                return IconButton(
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  icon: Icon(
                                    idx <= _newRating ? Icons.star : Icons.star_border,
                                    color: const Color(0xFFFFC107),
                                  ),
                                  onPressed: () => setState(() => _newRating = idx),
                                );
                              }),
                            ),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _reviewController,
                              maxLines: 3,
                              decoration: InputDecoration(
                                hintText: 'product_detail.write_review_hint'.tr(),
                                border: const OutlineInputBorder(),
                                isDense: true,
                                contentPadding: const EdgeInsets.all(10),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                ElevatedButton(
                                  onPressed: _submittingReview ? null : _submitReview,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryPink,
                                  ),
                                  child: _submittingReview
                                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                      : Text('product_detail.send'.tr(), style: const TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  // Comentarios / Reseñas
                  const SizedBox(height: 8),
                  Text('product_detail.reviews'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  // Reviews dynamic content
                  if (_loadingReviews)
                    const Center(child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: CircularProgressIndicator(),
                    ))
                  else if (_reviews.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Text('product_detail.no_reviews_yet'.tr(), style: TextStyle(color: Colors.grey[600])),
                    )
                  else
                    ..._reviews.map((r) {
                      final user = r['user'] as Map<String, dynamic>? ?? {};
                      final nombre = user['nombre'] ?? 'Usuario';
                      final double rating = (r['rating'] as num?)?.toDouble() ?? 0.0;
                      final comentario = r['comentario'] ?? '';
                      final int starCount = rating.round().clamp(0, 5);
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          isThreeLine: comentario.isNotEmpty,
                          leading: CircleAvatar(child: Text((nombre as String).isNotEmpty ? nombre[0].toUpperCase() : '?')),
                          title: Text(nombre),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 6),
                              Row(
                                children: List.generate(5, (i) => Icon(i < starCount ? Icons.star : Icons.star_border, size: 14, color: const Color(0xFFFFC107))),
                              ),
                              if (comentario.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(comentario),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  // Ajustar espacio inferior para evitar overflow por el bottomNavigationBar
                  SizedBox(height: MediaQuery.of(context).padding.bottom + 16),
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

// Note: TabBar removed — single vertical scroll layout used instead.
