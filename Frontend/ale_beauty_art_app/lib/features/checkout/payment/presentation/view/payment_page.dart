import 'package:ale_beauty_art_app/features/checkout/payment/presentation/data/repository/payment_repository.dart';
import 'package:flutter/material.dart';

class PaymentPage extends StatefulWidget {
  final int orderId;
  final double amount;
  final String token; // nuevo ⚡

  const PaymentPage(
      {super.key,
      required this.orderId,
      required this.amount,
      required this.token});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  final _cardNumber = TextEditingController();
  final _expiryMonth = TextEditingController();
  final _expiryYear = TextEditingController();
  final _cvv = TextEditingController();
  final _name = TextEditingController();
  final _docType = TextEditingController();
  final _docNumber = TextEditingController();
  final _email = TextEditingController();

  final _mpService = MercadoPagoService();

  Future<void> _processPayment() async {
    // 1. Crear token de tarjeta con la Public Key
    final token = await _mpService.createCardToken(
      cardNumber: _cardNumber.text,
      expirationMonth: int.tryParse(_expiryMonth.text) ?? 0,
      expirationYear: int.tryParse(_expiryYear.text) ?? 0,
      securityCode: _cvv.text,
      cardholderName: _name.text,
      identificationType: _docType.text,
      identificationNumber: _docNumber.text,
    );

    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error al tokenizar la tarjeta")),
      );
      return;
    }

    print("Token generado MP: $token"); // confirma token
    // 2. Detectar el método de pago (Visa, Master, etc.) usando el BIN
    final bin = _cardNumber.text.replaceAll(' ', '').substring(0, 6);
    final paymentMethodId = await _mpService.getPaymentMethod(bin);

    if (paymentMethodId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                "Tarjeta no soportada o BIN no reconocido por Mercado Pago")),
      );
      return;
    }

    // 3. Llamar a tu backend con el token y la orden
    final paymentResponse = await _mpService.payWithBackend(
      token: token,
      amount: widget.amount,
      paymentMethodId: paymentMethodId,
      email: _email.text,
      docType: _docType.text,
      docNumber: _docNumber.text,
      orderId: widget.orderId,
    );

    print("Respuesta backend: $paymentResponse");

    // 4. Mostrar resultado
    if (paymentResponse["status"] == "approved") {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Pago aprobado")),
      );
      Navigator.pop(context, true); // Regresa confirmación al flujo anterior
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("❌ Pago ${paymentResponse["status"]}")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Formulario de Pago")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Text("Procesar pago para la orden: ${widget.orderId}",
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            TextField(
                controller: _cardNumber,
                decoration:
                    const InputDecoration(labelText: "Número de tarjeta")),
            Row(
              children: [
                Expanded(
                    child: TextField(
                        controller: _expiryMonth,
                        decoration:
                            const InputDecoration(labelText: "Mes exp"))),
                const SizedBox(width: 10),
                Expanded(
                    child: TextField(
                        controller: _expiryYear,
                        decoration:
                            const InputDecoration(labelText: "Año exp"))),
              ],
            ),
            TextField(
                controller: _cvv,
                decoration: const InputDecoration(labelText: "CVV")),
            TextField(
                controller: _name,
                decoration:
                    const InputDecoration(labelText: "Nombre del titular")),
            TextField(
                controller: _docType,
                decoration:
                    const InputDecoration(labelText: "Tipo doc (DNI, CC)")),
            TextField(
                controller: _docNumber,
                decoration:
                    const InputDecoration(labelText: "Número documento")),
            TextField(
                controller: _email,
                decoration: const InputDecoration(labelText: "Email")),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _processPayment,
              child: const Text("Pagar ahora"),
            ),
          ],
        ),
      ),
    );
  }
}
