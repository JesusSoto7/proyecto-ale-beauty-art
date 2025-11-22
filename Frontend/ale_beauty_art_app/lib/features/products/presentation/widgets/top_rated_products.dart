import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/features/products/presentation/bloc/product_bloc.dart';
import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// TopRatedProducts
///
/// Displays a horizontal list with the top [fromTop] products by
/// `averageRating` and shows up to [displayCount] items (default 4).
/// Each card shows only the image and the numeric average with a
/// small rank badge in the top-left. Cards have a subtle shadow and
/// border so they are visible over a white background.
class TopRatedProducts extends StatelessWidget {
  final int displayCount;
  final int fromTop;

  const TopRatedProducts({super.key, this.displayCount = 4, this.fromTop = 10});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductBloc, ProductState>(
      builder: (context, state) {
        if (state is ProductLoadSuccess) {
          final sorted = List<Product>.from(state.products);
          sorted.sort((a, b) => (b.averageRating ?? 0).compareTo(a.averageRating ?? 0));

          final topLimit = sorted.take(fromTop).toList();
          final display = topLimit.take(displayCount).toList();

          if (display.isEmpty) return const SizedBox.shrink();

          return SizedBox(
            height: 170,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: display.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final p = display[index];
                final rank = index + 1;

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
                        // Image area
                        Expanded(
                          child: Stack(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                    color: const Color(0xFFFAFAFA),
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.08),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                    border: Border.all(color: Colors.grey.withOpacity(0.06)),
                                  ),
                                clipBehavior: Clip.hardEdge,
                                child: p.imagenUrl != null && p.imagenUrl!.isNotEmpty
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

                              // Rank badge (match discounts badge gradient + shadow)
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

                        const SizedBox(height: 6),

                        // Average rating (only numeric)
                        if (p.averageRating != null)
                          Center(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star, color: Color(0xFFFFC107), size: 14),
                                const SizedBox(width: 6),
                                Text(p.averageRating!.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.black87)),
                              ],
                            ),
                          )
                        else
                          const SizedBox(height: 12),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        }

        if (state is ProductLoadInProgress) return const SizedBox(height: 170, child: LoadingView());
        return const SizedBox.shrink();
      },
    );
  }
}
