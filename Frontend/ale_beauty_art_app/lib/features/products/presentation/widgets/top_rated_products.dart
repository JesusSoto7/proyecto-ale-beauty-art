import 'dart:convert';

import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/features/products/presentation/widgets/product_skeleton.dart';
// No depende de ProductBloc: usa directamente el endpoint `top_rated`
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:flutter/material.dart';

class TopRatedProducts extends StatefulWidget {
  final int displayCount;
  const TopRatedProducts({super.key, this.displayCount = 5});

  @override
  State<TopRatedProducts> createState() => _TopRatedProductsState();
}

class _TopRatedProductsState extends State<TopRatedProducts> {
  bool _loading = false;
  List<Product> _serverProducts = [];
  bool _fetchedFromServer = false;
  

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _fetchTopRatedFromServer();
    });
  }

  Future<void> _fetchTopRatedFromServer() async {
    if (_fetchedFromServer) return;
    setState(() => _loading = true);
    try {
      final client = await CustomHttpClient.client;
      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/products/top_rated?limit=${widget.displayCount}');
      final resp = await client.get(url, headers: {'Content-Type': 'application/json'});
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body);
        List<dynamic> list = [];
        if (body is List) {
          list = body;
        } else if (body is Map && body['products'] is List) {
          list = body['products'];
        }

        final products = list.map((e) {
          if (e is Map<String, dynamic>) return Product.fromJson(e);
          return Product.fromJson(Map<String, dynamic>.from(e));
        }).toList();

        if (mounted) {
          setState(() {
            _serverProducts = products;
            _fetchedFromServer = true;
          });
        }
        // If server returned no top-rated products, try a public fallback to /products
        if (products.isEmpty) {
          await _fetchFallbackProducts();
        }
      }
    } catch (_) {
      // ignore and try fallback
      await _fetchFallbackProducts();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _fetchFallbackProducts() async {
    try {
      final client = await CustomHttpClient.client;
      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/products');
      final resp = await client.get(url, headers: {'Content-Type': 'application/json'});
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body);
        if (body is List) {
          final products = body.map((e) {
            if (e is Map<String, dynamic>) return Product.fromJson(e);
            return Product.fromJson(Map<String, dynamic>.from(e));
          }).toList();
          if (mounted) {
            setState(() {
              _serverProducts = products.take(widget.displayCount).toList();
              _fetchedFromServer = true;
            });
          }
        }
      }
    } catch (e) {
      // ignore fallback errors
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return ProductsSkeletonCarousel(itemCount: widget.displayCount, compact: true);

    // Prefer server-provided top rated products (or fallback to `/products`).
    final display = _serverProducts;
    if (display.isEmpty) return const SizedBox.shrink();

    return SizedBox(
        height: 200,
        child: Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            itemCount: display.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final p = display[index];
              final rank = index + 1;
              final avg = p.averageRating ?? 0.0;
              final intStars = avg > 0 ? avg.round().clamp(1, 5) : 0;

              return GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ProductDetailView(product: p)),
                ),
                child: SizedBox(
                  width: 142,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.08),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 5,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          clipBehavior: Clip.hardEdge,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                height: 110,
                                decoration: const BoxDecoration(
                                  borderRadius: BorderRadius.only(
                                    topLeft: Radius.circular(18),
                                    topRight: Radius.circular(18),
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: const BorderRadius.only(
                                        topLeft: Radius.circular(18),
                                        topRight: Radius.circular(18),
                                      ),
                                      child: Container(
                                        width: double.infinity,
                                        height: double.infinity,
                                        color: const Color(0xFFFAFAFA),
                                        child: (p.imagenUrl?.isNotEmpty ?? false)
                                            ? Image.network(
                                                p.imagenUrl!,
                                                fit: BoxFit.cover,
                                                width: double.infinity,
                                                height: double.infinity,
                                              )
                                            : Center(
                                                child: Icon(
                                                  Icons.image_outlined,
                                                  size: 36,
                                                  color: Colors.grey[300],
                                                ),
                                              ),
                                      ),
                                    ),

                                    Positioned(
                                      top: 8,
                                      left: 8,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                            colors: [
                                              Color.fromARGB(255, 197, 78, 118),
                                              Color.fromARGB(255, 218, 55, 106),
                                            ],
                                          ),
                                          borderRadius: BorderRadius.circular(8),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(0xFFFF6B9D).withOpacity(0.4),
                                              blurRadius: 6,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Text('#$rank', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              Flexible(
                                fit: FlexFit.loose,
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.only(
                                      bottomLeft: Radius.circular(18),
                                      bottomRight: Radius.circular(18),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        p.nombreProducto,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                      Row(
                                        children: [
                                          Row(
                                            children: List.generate(5, (i) {
                                              final filled = i < intStars;
                                              return Icon(
                                                Icons.star,
                                                size: 14,
                                                color: filled ? const Color(0xFFFFC107) : Colors.grey[300],
                                              );
                                            }),
                                          ),
                                          const SizedBox(width: 8),
                                          if (avg > 0) Text(avg.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w600)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      );
  }
}

