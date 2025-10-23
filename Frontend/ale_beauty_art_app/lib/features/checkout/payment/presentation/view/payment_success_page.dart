import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/view/cart_page_view.dart';

class PaymentSuccessPage extends StatelessWidget {
  final double amount;
  final String? paymentId;
  final String? status;
  final String? paymentMethodId;
  final String? paymentTypeId;
  final String? cardLastFour;
  final String? cardholderName;
  final String? email;
  final String? approvedAt;
  final int? installments;

  const PaymentSuccessPage({
    super.key,
    required this.amount,
    this.paymentId,
    this.status,
    this.paymentMethodId,
    this.paymentTypeId,
    this.cardLastFour,
    this.cardholderName,
    this.email,
    this.approvedAt,
    this.installments,
  });

  String _brandLabel(String? methodId) {
    if (methodId == null) return '-';
    final id = methodId.toLowerCase();
    if (id.contains('visa')) return 'VISA';
    if (id.contains('master')) return 'MASTERCARD';
    if (id.contains('amex')) return 'AMEX';
    return methodId.toUpperCase();
  }
  
  String _typeLabel(String? typeId) {
    switch (typeId) {
      case 'credit_card':
        return 'Tarjeta de crédito';
      case 'debit_card':
        return 'Tarjeta débito';
      default:
        return '-';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
         automaticallyImplyLeading: false,
        title: const Text(
          'Pago aprobado',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Encabezado
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFD95D85).withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Icon(Icons.check_circle_rounded, size: 56, color: Colors.white),
                  const SizedBox(height: 10),
                  const Text(
                    '¡Pago aprobado!',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    formatPriceCOP(amount.toInt()),
                    style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Detalles (solo los esenciales solicitados)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _detailRow('Método', _brandLabel(paymentMethodId)),
                  const Divider(height: 20),
                  _detailRow('Tipo', _typeLabel(paymentTypeId)),
                  const Divider(height: 20),
                  _detailRow('Tarjeta', cardLastFour != null && cardLastFour!.isNotEmpty
                      ? '•••• $cardLastFour'
                      : '••••'),
                  const Divider(height: 20),
                  _detailRow('Titular', cardholderName ?? '-'),
                  const Divider(height: 20),
                  _detailRow('Email', email ?? '-'),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Botón
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD95D85),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  // Volver al raíz y luego abrir el carrito.
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const CartPageView()),
                  );
                },
                child: const Text(
                  'Continuar',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 110,
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.black54,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              color: Colors.black87,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
