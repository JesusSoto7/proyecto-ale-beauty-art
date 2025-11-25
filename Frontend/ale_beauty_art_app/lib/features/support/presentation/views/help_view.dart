import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ale_beauty_art_app/styles/text_styles.dart';
import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/core/views/login_view.dart';

class HelpView extends StatefulWidget {
  const HelpView({super.key});

  @override
  State<HelpView> createState() => _HelpViewState();
}

class _HelpViewState extends State<HelpView> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _lastNameCtrl = TextEditingController();
  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _subjectCtrl = TextEditingController();
  final TextEditingController _messageCtrl = TextEditingController();

  bool _loadingOrders = false;
  List<Map<String, dynamic>> _orders = [];
  int? _selectedOrderId;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthSuccess) {
        // Autocompletar nombre y email
        final user = authState.user;
        _nameCtrl.text = (user['nombre'] ?? '').toString();
        _lastNameCtrl.text = (user['apellido'] ?? '').toString();
        _emailCtrl.text = (user['email'] ?? '').toString();
        _fetchOrders();
      }
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _subjectCtrl.dispose();
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchOrders() async {
    setState(() => _loadingOrders = true);
    try {
      final client = await CustomHttpClient.client;
      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/my_orders');
      final resp = await client.get(url, headers: {'Content-Type': 'application/json'});
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body);
        List<dynamic> list = [];
        if (body is List) list = body;
        else if (body is Map && body['orders'] is List) list = body['orders'];

        final orders = list.map((e) {
          if (e is Map<String, dynamic>) return e;
          return Map<String, dynamic>.from(e);
        }).toList();

        setState(() {
          _orders = orders.cast<Map<String, dynamic>>();
        });
      }
    } catch (e) {
      // ignore
    } finally {
      if (mounted) setState(() => _loadingOrders = false);
    }
  }

  Future<void> _sendMessage() async {
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthSuccess) {
      // Forzar login
      final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage()));
      if (result != true) return;
    }

    if (!_formKey.currentState!.validate()) return;

    // El backend requiere `order_id` (columna NOT NULL). Asegurarnos de que se seleccione.
    if (_selectedOrderId == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Por favor selecciona una orden antes de enviar.')));
      return;
    }

    setState(() => _submitting = true);
    try {
      final client = await CustomHttpClient.client;
      final url = Uri.parse('${CustomHttpClient.baseUrl}/api/v1/support_messages');
      // Enviar solo los atributos que el modelo soporta: message_text y order_id.
      final payload = {
        'support_message': {
          'message_text': _messageCtrl.text.trim(),
          'order_id': _selectedOrderId!,
        }
      };

      final resp = await client.post(url, headers: {'Content-Type': 'application/json'}, body: jsonEncode(payload));
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('support.send_success'.tr())));
        _messageCtrl.clear();
        setState(() => _selectedOrderId = null);
      } else {
        String detail = '';
        try {
          final body = jsonDecode(resp.body);
          if (body is Map && body['message'] != null) detail = body['message'].toString();
          else if (body is Map && body['errors'] != null) detail = (body['errors'] as List).join(', ');
        } catch (_) {}
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('support.send_error'.tr() + (detail.isNotEmpty ? ': $detail' : ''))));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('support.send_error'.tr())));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromRGBO(209, 112, 143, 1),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: Text('support.help'.tr(), style: AppTextStyles.title.copyWith(color: Colors.white)),
        automaticallyImplyLeading: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(40),
              topRight: Radius.circular(40),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('support.need_help'.tr(), style: AppTextStyles.title.copyWith(fontSize: 20)),
                const SizedBox(height: 12),
                Text('support.help_description'.tr(), style: const TextStyle(fontSize: 14, color: Colors.black87)),
                const SizedBox(height: 12),

                // Contact details block
                Card(
                  elevation: 0,
                  color: const Color(0xFFF7F7F7),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.email_outlined, size: 18, color: Colors.black54),
                            const SizedBox(width: 8),
                            Text('support.contact_email'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('support.contact_email_desc'.tr(), style: const TextStyle(color: Colors.black87)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(Icons.phone_outlined, size: 18, color: Colors.black54),
                            const SizedBox(width: 8),
                            Text('support.contact_phone'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('support.contact_phone_desc'.tr(), style: const TextStyle(color: Colors.black87)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined, size: 18, color: Colors.black54),
                            const SizedBox(width: 8),
                            Text('support.address'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('support.address_desc'.tr(), style: const TextStyle(color: Colors.black87)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Sólo selector de orden (si existe) y campo de mensaje
                      if (_loadingOrders)
                        const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 8), child: CircularProgressIndicator()))
                      else if (_orders.isNotEmpty) ...[
                        DropdownButtonFormField<int>(
                          value: _selectedOrderId,
                          items: _orders.map((o) => DropdownMenuItem<int>(value: o['id'] as int, child: Text(o['numero_de_orden'].toString()))).toList(),
                          onChanged: (v) => setState(() => _selectedOrderId = v),
                          decoration: InputDecoration(labelText: 'support.select_order'.tr()),
                        ),
                        const SizedBox(height: 8),
                      ],

                      TextFormField(
                        controller: _messageCtrl,
                        decoration: InputDecoration(labelText: 'support.help'.tr()),
                        maxLines: 6,
                        validator: (v) => (v == null || v.trim().isEmpty) ? 'support.message_required'.tr() : null,
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _submitting ? null : _sendMessage,
                          child: _submitting ? const LoadingView() : Text('support.send'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),
                Text('support.faq'.tr(), style: AppTextStyles.title.copyWith(fontSize: 16)),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView(
                    children: [
                      ListTile(title: Text('support.faq_q1'.tr()), subtitle: Text('support.faq_a1'.tr())),
                      ListTile(title: Text('support.faq_q2'.tr()), subtitle: Text('support.faq_a2'.tr())),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
