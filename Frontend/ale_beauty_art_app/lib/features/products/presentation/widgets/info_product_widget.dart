import 'package:ale_beauty_art_app/features/products/presentation/views/products_Detail_View.dart';
import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/models/product.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';

class InfoProduct extends StatelessWidget {
  final List<Product> products;

  const InfoProduct({super.key, required this.products});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16), //Espacio Al rededor de la lista
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index]; // Producto actual en el índice

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
                  borderRadius: BorderRadius.circular(16),
                ),
            color: Colors.white, // Fondo blanco para cada tarjeta
            margin: const EdgeInsets.symmetric(vertical: 8), // Separación vertical entre tarjetas
            elevation: 4, // Sombra
            child: Padding(
              padding: const EdgeInsets.all(12), // Espacio interno dentro de la tarjeta
              child: Row(
                children: [
                  // Imagen del producto con bordes redondeados
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      product.imagenUrl ?? 'https://via.placeholder.com/150',// URL de la imagen del producto
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover, // Cubrir toda el área sin distorsionar
                      // Si la imagen falla, muestra un contenedor gris con ícono de error
                      errorBuilder: (context, error, stackTrace) =>
                          Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey[300],
                        child: const Icon(Icons.broken_image, color: Colors.grey),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16), // Espacio entre imagen y texto

                  // Columna con texto: nombre, descripción y precio
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start, // Alineado a la izquierda
                      children: [
                        Text(
                          product.nombreProducto, // Llamo al nombre del producto
                          style: AppTextStyles.title,
                        ),
                        const SizedBox(height: 4), // Espacio pequeño entre textos
                        Text(
                          product.descripcion, //descripcion del prodcuto
                          style: AppTextStyles.subtitle, // Estilo para descripción
                          maxLines: 2, // Máximo 2 líneas para que no ocupe mucho espacio
                          overflow: TextOverflow.ellipsis, // Si es más largo, poner "..."
                        ),
                        const SizedBox(height: 8), // Separación antes del precio
                        Text(
                          '\$${product.precioProducto} COP', // Precio del producto
                          style: AppTextStyles.price, // Estilo para el precio
                        ),
                      ],
                    ),
                  ),
                ],
              ),
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
