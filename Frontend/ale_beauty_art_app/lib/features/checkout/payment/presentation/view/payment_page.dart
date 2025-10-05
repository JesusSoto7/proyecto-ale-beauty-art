import 'package:ale_beauty_art_app/features/checkout/payment/presentation/data/repository/payment_repository.dart';
import 'package:flutter/material.dart';

class PaymentPage extends StatefulWidget {
  final int orderId;
  final double amount;
  final String token;

  const PaymentPage({
    super.key,
    required this.orderId,
    required this.amount,
    required this.token,
  });

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  final _cardNumber = TextEditingController();
  final _expiryMonth = TextEditingController();
  final _expiryYear = TextEditingController();
  final _cvv = TextEditingController();
  final _name = TextEditingController();
  final _docNumber = TextEditingController();
  final _email = TextEditingController();

  String _selectedDocType = "CC"; // valor por defecto
  final List<String> _docTypes = ["CC", "NIT", "TI", "CE"]; // Ejemplo Colombia

  final _mpService = MercadoPagoService();
  bool _loading = false;

  Future<void> _processPayment() async {
    setState(() => _loading = true);

    int year = int.tryParse(_expiryYear.text) ?? 0;
    if (year < 100) year += 2000;

    final token = await _mpService.createCardToken(
      cardNumber: _cardNumber.text,
      expirationMonth: int.tryParse(_expiryMonth.text) ?? 0,
      expirationYear: year, // Usa el año corregido
      securityCode: _cvv.text,
      cardholderName: _name.text,
      identificationType: _selectedDocType, // Debe ser "CC"
      identificationNumber: _docNumber.text,
    );

    if (token == null) {
      _showMessage("Error al tokenizar la tarjeta");
      setState(() => _loading = false);
      return;
    }

    final paymentMethod = await _mpService.getPaymentMethod(_cardNumber.text);
    final paymentMethodId = paymentMethod?["id"];

    if (paymentMethod == null ||
        (paymentMethod["payment_type_id"] != "credit_card" &&
            paymentMethod["payment_type_id"] != "debit_card")) {
      _showMessage("No se detectó una tarjeta válida. Intenta otra.");
      setState(() => _loading = false);
      return;
    }

    final response = await _mpService.payWithBackend(
      token: token,
      transaction_amount: widget.amount,
      paymentMethodId: paymentMethodId,
      email: _email.text,
      docType: _selectedDocType,
      docNumber: _docNumber.text,
      orderId: widget.orderId,
    );

    final status =
        response["status"] ?? response["payment"]?["status"] ?? "unknown";

    if (status == "approved") {
      _showMessage("✅ Pago aprobado");
      Navigator.pop(context, true);
    } else {
      _showMessage("❌ Pago $status: ${response["detail"] ?? ''}");
    }

    setState(() => _loading = false);
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  InputDecoration _inputDecoration(String label, {IconData? icon}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: icon != null ? Icon(icon) : null,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Formulario de Pago"),
        backgroundColor: const Color(0xFFAD476B),
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Total a pagar: \$${widget.amount.toStringAsFixed(2)}",
                            style: theme.textTheme.titleMedium!.copyWith(
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFFB168C8),
                            ),
                          ),
                          const SizedBox(height: 30),
                          TextField(
                            controller: _cardNumber,
                            keyboardType: TextInputType.number,
                            decoration: _inputDecoration(
                              "Número de tarjeta",
                              icon: Icons.credit_card,
                            ),
                          ),
                          const SizedBox(height: 30),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _expiryMonth,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration("Mes exp. (MM)"),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: TextField(
                                  controller: _expiryYear,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration("Año exp. (YY)"),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: TextField(
                                  controller: _cvv,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration("CVV"),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 30),
                          TextField(
                            controller: _name,
                            decoration: _inputDecoration(
                              "Nombre del titular",
                              icon: Icons.person,
                            ),
                          ),
                          const SizedBox(height: 30),
                          Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: DropdownButtonFormField<String>(
                                  value: _selectedDocType,
                                  decoration: _inputDecoration("Tipo doc."),
                                  items: _docTypes.map((type) {
                                    return DropdownMenuItem(
                                      value: type,
                                      child: Text(type),
                                    );
                                  }).toList(),
                                  onChanged: (value) {
                                    setState(() => _selectedDocType = value!);
                                  },
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                flex: 2,
                                child: TextField(
                                  controller: _docNumber,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration(
                                    "Número documento",
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 30),
                          Text(
                            "Completa tu información",
                            style: theme.textTheme.titleMedium!.copyWith(
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            decoration: _inputDecoration(
                              "E-mail",
                              icon: Icons.email_outlined,
                            ),
                          ),
                          const SizedBox(height: 30),
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton.icon(
                              onPressed: _processPayment,
                              icon: const Icon(Icons.lock_outline,
                                  color: Colors.white),
                              label: const Text(
                                "Pagar",
                                style: TextStyle(
                                    fontSize: 16, color: Colors.white),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor:
                                    const Color(0xFFCC6198), // rosado-lila
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
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
  }
}
