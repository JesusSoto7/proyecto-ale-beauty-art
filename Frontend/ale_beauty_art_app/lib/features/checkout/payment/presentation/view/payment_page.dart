import 'package:flutter/material.dart';

class PaymentPage extends StatelessWidget {
  final int orderId;

  const PaymentPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Formulario de Pago")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Procesar pago para la orden: $orderId"),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Aquí luego llamamos a tu PaymentBloc -> createPayment
              },
              child: const Text("Pagar ahora"),
            ),
          ],
        ),
      ),
    );
  }
}
