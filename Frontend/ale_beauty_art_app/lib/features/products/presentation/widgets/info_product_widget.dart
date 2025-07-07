import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class InfoProduct extends StatelessWidget {
  final List<Product> products;

  const InfoProduct({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, //  2 productos por fila
        mainAxisSpacing: 10, // Espacio vertical reducido
        crossAxisSpacing: 10, // Espacio horizontal reducido
        childAspectRatio: 1.1, //  Ajusta proporción alto/ancho
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductDetailView(product: product),
              ),
            );
          },
          child: Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            color: Colors.white,
            elevation: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Imagen con tamaño limitado y centrada
                Container(
                  height: 130,
                  margin: const EdgeInsets.all(8), // 👈 margen para centrar
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.pink.shade100,
                        Colors.pinkAccent.shade100,
                      ],
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child:product.fullImageUrl.isNotEmpty
                        ? Image.network(
                            product.fullImageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                const Center(
                              child: Text(
                                '💋',
                                style: TextStyle(fontSize: 28),
                              ),
                            ),
                          )
                        : const Center(
                            child: Text(
                              '💋',
                              style: TextStyle(fontSize: 28),
                            ),
                          ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Nombre del producto (máximo 2 líneas)
                      Text(
                        product.nombreProducto,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          color: Color(0xFF1F2937),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      Text(
                        '\$${product.precioProducto.toStringAsFixed(2)}',
                        style: AppTextStyles.price.copyWith(
                          color: Colors.pinkAccent,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}




//Logica de de donde se saca la informacion del json
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: ListView.builder(
//         itemCount: products.length,
//         itemBuilder: (context, index) {
//           final p = products[index];
//           return ListTile(
//             title: Text(p.name),
//             subtitle: Text(p.description),
//             trailing: Text('\$${p.price.toStringAsFixed(2)}'),
//           );
//         },
//       ),
//     );
//   }
// }
