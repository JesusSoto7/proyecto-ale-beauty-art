import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
    // Listen message changes so button enabled/disabled updates immediately
    _messageCtrl.addListener(() {
      if (mounted) setState(() {});
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
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('support.select_order_required'.tr())));
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
    // Use AnnotatedRegion to enforce system UI style for this view only.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: const Color.fromRGBO(209, 112, 143, 1),
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          title: Text('support.help'.tr(), style: AppTextStyles.title.copyWith(color: Colors.white)),
          automaticallyImplyLeading: true,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        // allow the white rounded container to extend behind the system nav bar
        extendBody: true,
        body: SafeArea(
          bottom: false,
          child: Container(
            width: double.infinity,
            height: MediaQuery.of(context).size.height,
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
                        // Selector de orden (si existe)
                        if (_loadingOrders)
                          const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 8), child: LoadingIndicator()))
                        else if (_orders.isNotEmpty) ...[
                          Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF9F7FA),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFEDE7F0)),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: DropdownButtonFormField<int>(
                              value: _selectedOrderId,
                              items: _orders.map((o) => DropdownMenuItem<int>(value: o['id'] as int, child: Text(o['numero_de_orden'].toString()))).toList(),
                              onChanged: (v) => setState(() => _selectedOrderId = v),
                              decoration: InputDecoration(
                                labelText: 'support.select_order'.tr(),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                        ] else ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: Text('support.select_order_required'.tr(), style: const TextStyle(color: Colors.black54)),
                          ),
                        ],

                        // Mostrar campo de mensaje y botón SOLO cuando se haya seleccionado una orden
                        if (_selectedOrderId != null) ...[
                          TextFormField(
                            controller: _messageCtrl,
                            decoration: InputDecoration(
                              labelText: 'support.help'.tr(),
                              hintText: 'support.message_required'.tr(),
                              filled: true,
                              fillColor: const Color(0xFFF9F9FB),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.transparent)),
                              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.primaryPink)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            ),
                            maxLines: 6,
                            validator: (v) => (v == null || v.trim().isEmpty) ? 'support.message_required'.tr() : null,
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: (_submitting || _messageCtrl.text.trim().isEmpty) ? null : _sendMessage,
                              child: _submitting ? const LoadingIndicator(size: 18, color: Colors.white) : Text('support.send'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryPink,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),
                  Text('support.faq'.tr(), style: AppTextStyles.title.copyWith(fontSize: 16)),
                  const SizedBox(height: 8),
                  Expanded(
                    child: ListView(
                      padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom + 4),
                      children: [
                        ListTile(title: Text('support.faq_q1'.tr()), subtitle: Text('support.faq_a1'.tr())),
                        ListTile(title: Text('support.faq_q2'.tr()), subtitle: Text('support.faq_a2'.tr())),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
