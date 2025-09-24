import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_custom_tabs/flutter_custom_tabs.dart' as custom_tabs;

class PaymentPage extends StatefulWidget {
  final int orderId;

  const PaymentPage({super.key, required this.orderId, required String url});

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  bool isLoading = false;

  String get baseUrl => '/api/v1'; // ya CustomHttpClient usa API_BASE_URL

  // Crear preferencia de pago
  Future<String?> createPreference() async {
    try {
      final response = await CustomHttpClient.postRequest(
        '$baseUrl/payments/create_preference',
        {'order_id': widget.orderId},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['init_point'];
      } else {
        debugPrint('Error creando preferencia: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Excepción createPreference: $e');
      return null;
    }
  }

  // Consultar estado de la orden
  Future<String?> checkOrderStatus() async {
    try {
      final response = await CustomHttpClient.getRequest(
        '$baseUrl/orders/${widget.orderId}/status',
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['status']; // pagada, pendiente, cancelada
      } else {
        debugPrint('Error consultando estado: ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('Excepción checkOrderStatus: $e');
      return null;
    }
  }

  void _startPayment() async {
    setState(() => isLoading = true);

    final initPoint = await createPreference();
    if (initPoint == null) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo crear la preferencia')),
      );
      return;
    }

    try {
      await custom_tabs.launchUrl(
        Uri.parse(initPoint),
        customTabsOptions: const custom_tabs.CustomTabsOptions(showTitle: true),
        safariVCOptions: const custom_tabs.SafariViewControllerOptions(
          preferredBarTintColor: Colors.white,
          preferredControlTintColor: Colors.black,
        ),
      );

      await Future.delayed(const Duration(seconds: 3));
      final status = await checkOrderStatus();

      setState(() => isLoading = false);

      if (status == 'pagada') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago exitoso')),
        );
        Navigator.pop(context, true);
      } else if (status == 'cancelada') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago cancelado')),
        );
        Navigator.pop(context, false);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago pendiente')),
        );
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al abrir Mercado Pago: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pago')),
      body: Center(
        child: isLoading
            ? const CircularProgressIndicator()
            : ElevatedButton(
                onPressed: _startPayment,
                child: const Text('Ir a Mercado Pago'),
              ),
      ),
    );
  }
}
