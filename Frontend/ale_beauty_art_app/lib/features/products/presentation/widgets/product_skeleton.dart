import 'package:flutter/material.dart';

class ProductsSkeletonCarousel extends StatelessWidget {
  final int itemCount;
  final bool compact;
  const ProductsSkeletonCarousel({super.key, this.itemCount = 6, this.compact = false});

  @override
  Widget build(BuildContext context) {
    // Make the skeleton slimmer and a bit taller per request
    final double carouselHeight = compact ? 224 : 264; // taller
    final double imageHeight = compact ? 132 : 150; // taller image
    final double screenW = MediaQuery.of(context).size.width;
    final double cardWidth = screenW * 0.32; // even slimmer

    return SizedBox(
      height: carouselHeight,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          itemCount: itemCount,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) {
            return Container(
              width: cardWidth,
              height: carouselHeight,
              margin: const EdgeInsets.symmetric(horizontal: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // image skeleton (match carousel image height)
                  Container(
                    height: 100,
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(topLeft: Radius.circular(18), topRight: Radius.circular(18)),
                      color: Colors.grey.shade200,
                    ),
                  ),
                  // info skeleton: single grey bar simulating the text
                  Container(
                    height: carouselHeight - imageHeight,
                    padding: const EdgeInsets.fromLTRB(8, 6, 8, 0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        height: 4,
                        color: Colors.grey.shade200,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
