import 'dart:convert';

import 'package:collection/collection.dart';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class TopRatedProducts extends StatefulWidget {
  final int displayCount;
  final int fromTop;

  const TopRatedProducts({super.key, this.displayCount = 5, this.fromTop = 20});

  @override
  State<TopRatedProducts> createState() => _TopRatedProductsState();
}

class _TopRatedProductsState extends State<TopRatedProducts> {
  final Map<int, double> _avg = {}; // productId -> average
  final Map<int, int> _count = {}; // productId -> reviews count
  bool _loading = false;
  List<int> _lastCandidateIds = [];
  List<Product> _serverProducts = [];
  bool _fetchedFromServer = false;

  @override
  void initState() {
    super.initState();
  }

  Future<void> _fetchTopRatedFromServer() async {
    if (_fetchedFromServer) return;
    _fetchedFromServer = true;
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final client = await CustomHttpClient.client;
      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/products/top_rated?limit=${widget.displayCount}');
      final resp = await client.get(url, headers: {'Content-Type': 'application/json'});
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as List<dynamic>;
        final items = <Product>[];
        for (final e in data) {
          if (e is Map<String, dynamic>) {
            // create Product from JSON (the server returns the usual product fields + average_rating/reviews_count)
            final prod = Product.fromJson(e);
            items.add(prod);
            final avgVal = (e['average_rating'] as num?)?.toDouble() ?? (e['average'] as num?)?.toDouble() ?? 0.0;
            final cntVal = (e['reviews_count'] as num?)?.toInt() ?? (e['reviews_count'] as int?) ?? 0;
            _avg[prod.id] = avgVal;
            _count[prod.id] = cntVal;
          }
        }
        if (!mounted) return;
        setState(() {
          _serverProducts = items;
          _loading = false;
        });
        return;
      }
    } catch (e) {
      // ignore and fallback to client-side aggregation
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _fetchRatingsForCandidates(List<Product> candidates) async {
    final ids = candidates.map((p) => p.id).toList();
    if (ids.isEmpty) return;
    if (ListEquality().equals(ids, _lastCandidateIds) && _avg.isNotEmpty) return;

    _lastCandidateIds = ids;
    setState(() => _loading = true);

    final client = await CustomHttpClient.client;

    const batchSize = 6;
    for (var i = 0; i < candidates.length; i += batchSize) {
      final batch = candidates.sublist(i, (i + batchSize).clamp(0, candidates.length));
      await Future.wait(batch.map((p) async {
        try {
          if (_avg.containsKey(p.id) && _count.containsKey(p.id)) return;
          final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/products/${p.id}/reviews');
          final resp = await client.get(url, headers: {'Content-Type': 'application/json'});
          if (resp.statusCode == 200) {
            final data = jsonDecode(resp.body) as List<dynamic>;
            final reviews = data.cast<Map<String, dynamic>>();
            final cnt = reviews.length;
            final avg = cnt > 0
                ? reviews.map((r) => (r['rating'] as num?)?.toDouble() ?? 0.0).reduce((a, b) => a + b) / cnt
                : 0.0;
            _avg[p.id] = avg;
            _count[p.id] = cnt;
          } else {
            _avg[p.id] = 0.0;
            _count[p.id] = 0;
          }
        } catch (e) {
          _avg[p.id] = 0.0;
          _count[p.id] = 0;
        }
      }));
      await Future.delayed(const Duration(milliseconds: 120));
    }

    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductBloc, ProductState>(
      builder: (context, state) {
        if (state is ProductLoadSuccess) {
          final candidates = state.products.take(widget.fromTop).toList();

          // Schedule fetching after the current build frame to avoid calling
          // setState() during build (which throws). Only schedule when the
          // candidate ids changed or we don't have cached averages yet.
          final ids = candidates.map((p) => p.id).toList();
          final shouldFetch = ids.isNotEmpty && (!ListEquality().equals(ids, _lastCandidateIds) || _avg.isEmpty);
          if (shouldFetch) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) _fetchRatingsForCandidates(candidates);
            });
          }

          // Prefer server-provided top rated list if available; otherwise compute locally
          final display = _serverProducts.isNotEmpty
              ? _serverProducts.take(widget.displayCount).toList()
              : (() {
                  final withRatings = List<Product>.from(candidates);
                  withRatings.sort((a, b) {
                    final avA = _avg[a.id] ?? 0.0;
                    final avB = _avg[b.id] ?? 0.0;
                    return avB.compareTo(avA);
                  });
                  return withRatings.where((p) => (_count[p.id] ?? 0) > 0).take(widget.displayCount).toList();
                })();

          // If we haven't fetched the server list yet, schedule it now. This
          // will fetch a single endpoint that returns precomputed averages.
          if (!_fetchedFromServer) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) _fetchTopRatedFromServer();
            });
          }

          // While we're fetching ratings or waiting server response, show the loading view
          if (_loading) return SizedBox(height: 200, child: Padding(padding: const EdgeInsets.only(bottom: 12), child: LoadingView()));

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
                  final avg = _avg[p.id] ?? 0.0;
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
                              margin: const EdgeInsets.symmetric(
                                vertical: 6, // 🆕 Margen vertical para evitar corte
                              ),
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
                                  // Image area with rounded top corners
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
                                                    errorBuilder: (_, __, ___) => Center(
                                                      child: Icon(
                                                        Icons.image_not_supported_outlined,
                                                        size: 36,
                                                        color: Colors.grey[300],
                                                      ),
                                                    ),
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

                                        // Rank badge (top-left)
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

                                  // Bottom info area (white) matching popular cards style
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
                                          // Product name (single line)
                                          Text(
                                            p.nombreProducto,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                          ),

                                          // Stars + numeric average on the right
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
                                              if (avg > 0)
                                                Text(avg.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w600)),
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

        if (state is ProductLoadInProgress) return SizedBox(height: 200, child: Padding(padding: const EdgeInsets.only(bottom: 12), child: LoadingView()));
        return const SizedBox.shrink();
      },
    );
  }
}
