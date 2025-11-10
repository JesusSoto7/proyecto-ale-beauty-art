import 'package:ale_beauty_art_app/core/utils/formatters.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_bloc.dart';
import 'package:ale_beauty_art_app/features/cart/presentation/bloc/cart_event.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/data/repository/payment_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/checkout/payment/presentation/view/payment_success_page.dart';
import 'package:easy_localization/easy_localization.dart';

class PaymentPage extends StatefulWidget {
  final int orderId;
  final double amount;
  final String token;
  // Si es true, al aprobar el pago se restaura el carrito previo (compra rápida)
  final bool restoreCartAfterPayment;

  const PaymentPage({
    super.key,
    required this.orderId,
    required this.amount,
    required this.token,
    this.restoreCartAfterPayment = false,
  });

  @override
  State<PaymentPage> createState() => _PaymentPageState();
}

class _PaymentPageState extends State<PaymentPage> {
  final _formKey = GlobalKey<FormState>();
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
  List<Map<String, dynamic>> _cartSnapshot = const [];

  @override
  void initState() {
    super.initState();
    // Si debemos restaurar el carrito, hacemos un snapshot del estado actual
    if (widget.restoreCartAfterPayment) {
      _snapshotCart();
    }
  }

  Future<void> _snapshotCart() async {
    try {
      // Asegurar token en CartBloc y cargar carrito actual
      context.read<CartBloc>().add(UpdateCartToken(widget.token));
      context.read<CartBloc>().add(LoadCart());
      await Future.delayed(const Duration(milliseconds: 300));
      final products = List<Map<String, dynamic>>.from(
          context.read<CartBloc>().state.products);
      setState(() {
        _cartSnapshot = products
            .map((p) => {
                  'product_id': p['product_id'],
                  'cantidad': (p['cantidad'] ?? 1) as int,
                })
            .toList();
      });
    } catch (_) {
      // Silencioso: si falla, simplemente no restauramos
    }
  }

  Future<void> _restoreCart() async {
    if (_cartSnapshot.isEmpty) return;
    // Reponer productos previos al pago
    context.read<CartBloc>().add(UpdateCartToken(widget.token));
    for (final item in _cartSnapshot) {
      final int productId = item['product_id'] as int;
      final int qty = (item['cantidad'] ?? 1) as int;
      for (int i = 0; i < qty; i++) {
        context.read<CartBloc>().add(AddProductToCart(productId: productId));
      }
    }
    // Dar tiempo a que se apliquen los eventos
    await Future.delayed(const Duration(milliseconds: 200));
    context.read<CartBloc>().add(LoadCart());
  }

  @override
  void dispose() {
    _cardNumber.dispose();
    _expiryMonth.dispose();
    _expiryYear.dispose();
    _cvv.dispose();
    _name.dispose();
    _docNumber.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _processPayment() async {
    if (!_formKey.currentState!.validate()) {
      _showMessage('payment.errors.complete_fields'.tr(), isError: true);
      return;
    }

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
      _showMessage('payment.errors.tokenize_failed'.tr(), isError: true);
      setState(() => _loading = false);
      return;
    }

    final paymentMethod = await _mpService.getPaymentMethod(_cardNumber.text);
    final paymentMethodId = paymentMethod?["id"];
    final paymentTypeId = paymentMethod?["payment_type_id"];

    if (paymentMethod == null ||
        (paymentMethod["payment_type_id"] != "credit_card" &&
            paymentMethod["payment_type_id"] != "debit_card")) {
      _showMessage('payment.errors.invalid_card'.tr(), isError: true);
      setState(() => _loading = false);
      return;
    }

    try {
      await _mpService.setOrderPaymentMethod(
        jwt: widget.token,
        orderId: widget.orderId,
        codigo:
            'mercadopago', // o envía un ID si manejas varios métodos en la app
      );
    } catch (e) {
      // No abortes el pago; el backend igual hace fallback a mercadopago.
      debugPrint('No se pudo marcar payment_method en orden: $e');
    }

    final response = await _mpService.payWithBackend(
      jwt: widget.token,
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
      // Preparar detalles para la vista de éxito
      final payment = response["payment"] ?? response;
      final paymentId = (payment["id"] ?? payment["payment_id"])?.toString();
      // Prefer the detected values from MP search; fallback to backend response
      final resolvedPaymentMethodId = (paymentMethodId ??
              (payment["payment_method_id"] ?? payment["method_id"]))
          ?.toString();
      final resolvedPaymentTypeId =
          (paymentTypeId ?? payment["payment_type_id"])?.toString();
      final cardLastFour =
          (payment["card"]?['last_four_digits'] ?? payment['last_four_digits'])
              ?.toString();
      final installments =
          payment['installments'] is int ? payment['installments'] as int : 1;
      final approvedAt =
          (payment['date_approved'] ?? payment['approved_at'])?.toString();

      // Si esta compra vino desde "Comprar" (compra rápida), restaurar carrito previo
      if (widget.restoreCartAfterPayment) {
        await _restoreCart();
      } else {
        // Caso checkout desde carrito: solo recarga
        context.read<CartBloc>().add(LoadCart());
      }

      if (!mounted) return;
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PaymentSuccessPage(
            amount: widget.amount,
            paymentId: paymentId,
            status: status,
            paymentMethodId: resolvedPaymentMethodId,
            paymentTypeId: resolvedPaymentTypeId,
            cardLastFour: cardLastFour ??
                _cardNumber.text
                    .replaceAll(' ', '')
                    .substring(_cardNumber.text.replaceAll(' ', '').length - 4),
            cardholderName: _name.text,
            email: _email.text,
            installments: installments,
            approvedAt: approvedAt,
          ),
        ),
      );
    } else {
      final detail = response["detail"] ?? 'payment.try_again'.tr();
      _showMessage(
        'payment.status_message'.tr(namedArgs: {
          "status": status.toString(),
          "detail": detail.toString()
        }),
        isError: true,
      );
    }

    setState(() => _loading = false);
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline : Icons.check_circle_outline,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
        backgroundColor:
            isError ? const Color(0xFFE53935) : const Color(0xFF4CAF50),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: Duration(seconds: isError ? 4 : 2),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, {IconData? icon}) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(
        color: Colors.black54,
        fontSize: 14,
      ),
      floatingLabelStyle: const TextStyle(
        color: Color(0xFFD95D85),
        fontWeight: FontWeight.w600,
      ),
      prefixIcon: icon != null
          ? Icon(icon, color: const Color(0xFFD95D85), size: 20)
          : null,
      filled: true,
      fillColor: const Color(0xFFFAFAFA),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Color(0xFFD95D85), width: 2),
        borderRadius: BorderRadius.circular(12),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Color(0xFFE53935), width: 1),
        borderRadius: BorderRadius.circular(12),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderSide: const BorderSide(color: Color(0xFFE53935), width: 2),
        borderRadius: BorderRadius.circular(12),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
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
            title: Text(
              'payment.title'.tr(),
              style: TextStyle(
                color: Colors.black87,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            leading: IconButton(
              icon: const Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 20,
                color: Color(0xFFD95D85),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            systemOverlayStyle: SystemUiOverlayStyle.dark,
          ),
        ),
      ),
      body: _loading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(
                    color: Color(0xFFD95D85),
                    strokeWidth: 3,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'payment.processing'.tr(),
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // 💰 Card de resumen de pago
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFFD95D85),
                            Color(0xFFE58BB1),
                          ],
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
                          Text(
                            'payment.summary.total_to_pay'.tr(),
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            formatPriceCOP(widget.amount.toInt()),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.security_rounded,
                                  color: Colors.white,
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'payment.summary.secure_payment'.tr(),
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 💳 Formulario de tarjeta
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
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
                          // Título de sección
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFEEF3),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.credit_card_rounded,
                                  color: Color(0xFFD95D85),
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'payment.sections.card_data'.tr(),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 20),

                          // Número de tarjeta
                          TextFormField(
                            controller: _cardNumber,
                            keyboardType: TextInputType.number,
                            decoration: _inputDecoration(
                              'payment.fields.card_number'.tr(),
                              icon: Icons.credit_card_rounded,
                            ),
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(16),
                            ],
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'payment.validators.required'.tr();
                              }
                              if (value.length < 13) {
                                return 'payment.validators.invalid_number'.tr();
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // Fecha de expiración y CVV
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _expiryMonth,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration(
                                      'payment.fields.month'.tr()),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(2),
                                  ],
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'payment.validators.required'.tr();
                                    }
                                    final month = int.tryParse(value);
                                    if (month == null ||
                                        month < 1 ||
                                        month > 12) {
                                      return 'payment.validators.invalid'.tr();
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextFormField(
                                  controller: _expiryYear,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration(
                                      'payment.fields.year'.tr()),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(2),
                                  ],
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'payment.validators.required'.tr();
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: TextFormField(
                                  controller: _cvv,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration(
                                      'payment.fields.cvv'.tr()),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(4),
                                  ],
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'payment.validators.required'.tr();
                                    }
                                    if (value.length < 3) {
                                      return 'payment.validators.invalid'.tr();
                                    }
                                    return null;
                                  },
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Nombre del titular
                          TextFormField(
                            controller: _name,
                            decoration: _inputDecoration(
                              'payment.fields.cardholder_name'.tr(),
                              icon: Icons.person_outline_rounded,
                            ),
                            textCapitalization: TextCapitalization.words,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'payment.validators.required'.tr();
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // 📋 Información personal
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
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
                          // Título de sección
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFEEF3),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.person_rounded,
                                  color: Color(0xFFD95D85),
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'payment.sections.personal_info'.tr(),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 20),

                          // Tipo y número de documento
                          Row(
                            children: [
                              Expanded(
                                flex: 1,
                                child: DropdownButtonFormField<String>(
                                  value: _selectedDocType,
                                  decoration: _inputDecoration(
                                      'payment.fields.doc_type'.tr()),
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
                              const SizedBox(width: 12),
                              Expanded(
                                flex: 2,
                                child: TextFormField(
                                  controller: _docNumber,
                                  keyboardType: TextInputType.number,
                                  decoration: _inputDecoration(
                                      'payment.fields.doc_number'.tr()),
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                  ],
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'payment.validators.required'.tr();
                                    }
                                    return null;
                                  },
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Email
                          TextFormField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            decoration: _inputDecoration(
                              'payment.fields.email'.tr(),
                              icon: Icons.email_outlined,
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'payment.validators.required'.tr();
                              }
                              if (!value.contains('@')) {
                                return 'payment.validators.invalid_email'.tr();
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 💳 Botón de pago
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFFD95D85),
                            Color.fromARGB(255, 238, 167, 196),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFD95D85).withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(14),
                          onTap: _processPayment,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.lock_rounded,
                                  color: Colors.white,
                                  size: 22,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  '${'payment.title'.tr()} ${formatPriceCOP(widget.amount.toInt())}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 17,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // 🔒 Texto de seguridad
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.verified_user_rounded,
                          size: 16,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'payment.security_text'.tr(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }
}
