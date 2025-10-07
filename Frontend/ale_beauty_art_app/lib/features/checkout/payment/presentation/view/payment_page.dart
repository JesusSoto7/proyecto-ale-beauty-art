import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/data/repository/payment_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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

  String _selectedDocType = "CC";
  final List<String> _docTypes = ["CC", "NIT", "TI", "CE"];

  final _mpService = MercadoPagoService();
  bool _loading = false;

  Future<void> _processPayment() async {
    setState(() => _loading = true);

    int year = int.tryParse(_expiryYear.text) ?? 0;
    if (year < 100) year += 2000;

    final token = await _mpService.createCardToken(
      cardNumber: _cardNumber.text,
      expirationMonth: int.tryParse(_expiryMonth.text) ?? 0,
      expirationYear: year,
      securityCode: _cvv.text,
      cardholderName: _name.text,
      identificationType: _selectedDocType,
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
      context.read<CartBloc>().add(LoadCart()); // <--- añade esto
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
      labelStyle: const TextStyle(
        color: Colors.black54,
      ),
      floatingLabelStyle: const TextStyle(
        color: Color(0xFFD95D85),
        fontWeight: FontWeight.w500,
      ),
      prefixIcon: icon != null ? Icon(icon, color: Color(0xFFD95D85)) : null,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Color(0xFFD95D85), width: 1.5),
        borderRadius: BorderRadius.circular(12),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            centerTitle: true,
            title: const Text(
              'Formulario de Pago',
              style: TextStyle(
                color: Colors.black,
                fontSize: 17,
                fontWeight: FontWeight.w500,
              ),
            ),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Colors.black87,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // ==== CONTENEDOR DEL FORMULARIO ====
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color.fromARGB(255, 90, 41, 66)
                              .withOpacity(0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Total a pagar: \$${widget.amount.toStringAsFixed(2)}",
                          style: theme.textTheme.titleMedium!.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFFD95D85),
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
                        const SizedBox(height: 25),
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
                        const SizedBox(height: 25),
                        TextField(
                          controller: _name,
                          decoration: _inputDecoration(
                            "Nombre del titular",
                            icon: Icons.person_outline,
                          ),
                        ),
                        const SizedBox(height: 25),
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
                                decoration:
                                    _inputDecoration("Número documento"),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 25),
                        TextField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          decoration: _inputDecoration(
                            "Correo electrónico",
                            icon: Icons.email_outlined,
                          ),
                        ),
                        const SizedBox(height: 35),

                        // ==== BOTÓN CON GRADIENTE ====
                        GestureDetector(
                          onTap: _processPayment,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Color.fromARGB(255, 219, 91, 131),
                                  Color.fromARGB(255, 240, 181, 206),
                                ],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.15),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.lock_outline,
                                      color: Colors.white, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    "Pagar",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
