import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../bloc/shipping_address_bloc.dart';
import '../bloc/shipping_address_event.dart';

class ShippingAddressAdd extends StatefulWidget {
  final ShippingAddress? editAddress;
  const ShippingAddressAdd({super.key, this.editAddress});

  @override
  State<ShippingAddressAdd> createState() => _ShippingAddressFormPageState();
}

class _ShippingAddressFormPageState extends State<ShippingAddressAdd> {
  final _formKey = GlobalKey<FormState>();
  final storage = const FlutterSecureStorage();

  final nombreController = TextEditingController();
  final apellidoController = TextEditingController();
  final telefonoController = TextEditingController();
  final direccionController = TextEditingController();
  final codigoPostalController = TextEditingController();
  final indicacionesController = TextEditingController();

  String? departmentId;
  String? municipalityId;
  String? neighborhoodId;

  List<dynamic> departments = [];
  List<dynamic> municipalities = [];
  List<dynamic> neighborhoods = [];

  bool get isEditing => widget.editAddress != null;

  @override
  void initState() {
    super.initState();
    _ensureTokenInBloc();
    _fillForm();
    _fetchDepartments();
  }

  Future<void> _ensureTokenInBloc() async {
    final token = await storage.read(key: 'jwt_token');
    if (token != null && token.isNotEmpty) {
      context.read<ShippingAddressBloc>().add(UpdateShippingToken(token));
    }
  }

  void _fillForm() {
    if (!isEditing) return;
    final a = widget.editAddress!;
    nombreController.text = a.nombre;
    apellidoController.text = a.apellido;
    telefonoController.text = a.telefono;
    direccionController.text = a.direccion;
    codigoPostalController.text = a.codigoPostal;
    indicacionesController.text = a.indicacionesAdicionales;
    departmentId = a.departmentId;
    municipalityId = a.municipalityId;
    neighborhoodId = a.neighborhoodId;

    if (departmentId != null) _fetchMunicipalities(departmentId!);
    if (municipalityId != null) _fetchNeighborhoods(municipalityId!);
  }

  Future<void> _fetchDepartments() async {
    try {
      final token = await storage.read(key: 'jwt_token');
      final client = await CustomHttpClient.client;
      final res = await client.get(
        Uri.parse('${CustomHttpClient.baseUrl}/api/v1/locations/departments'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token'
        },
      );
      if (res.statusCode == 200)
        setState(() => departments = jsonDecode(res.body));
    } catch (_) {}
  }

  Future<void> _fetchMunicipalities(String deptId) async {
    try {
      final token = await storage.read(key: 'jwt_token');
      final client = await CustomHttpClient.client;
      final res = await client.get(
        Uri.parse(
            '${CustomHttpClient.baseUrl}/api/v1/locations/municipalities/$deptId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token'
        },
      );
      if (res.statusCode == 200)
        setState(() => municipalities = jsonDecode(res.body));
    } catch (_) {}
  }

  Future<void> _fetchNeighborhoods(String munId) async {
    try {
      final token = await storage.read(key: 'jwt_token');
      final client = await CustomHttpClient.client;
      final res = await client.get(
        Uri.parse(
            '${CustomHttpClient.baseUrl}/api/v1/locations/neighborhoods/$munId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token'
        },
      );
      if (res.statusCode == 200)
        setState(() => neighborhoods = jsonDecode(res.body));
    } catch (_) {}
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'nombre': nombreController.text,
      'apellido': apellidoController.text,
      'telefono': telefonoController.text,
      'direccion': direccionController.text,
      'codigo_postal': codigoPostalController.text,
      'indicaciones_adicionales': indicacionesController.text,
      'department_id': departmentId,
      'municipality_id': municipalityId,
      'neighborhood_id': neighborhoodId,
    };

    try {
      await _ensureTokenInBloc();

      if (isEditing) {
        context
            .read<ShippingAddressBloc>()
            .add(UpdateAddress(widget.editAddress!.id, data));
      } else {
        context.read<ShippingAddressBloc>().add(AddAddress(data));
      }

      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.black87, fontSize: 15),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFD95D85), width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide(color: Colors.grey, width: 0.5),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      filled: true,
      fillColor: Colors.white,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.13),
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
              isEditing ? 'Editar dirección' : 'Nueva dirección',
              style: const TextStyle(
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 22),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 600),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 25),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color:
                      const Color.fromARGB(255, 121, 51, 74).withOpacity(0.25),
                  blurRadius: 15,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  const Text(
                    'Completa los siguientes campos:',
                    style: TextStyle(
                      color: Colors.black87,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // --- Campos del formulario ---
                  TextFormField(
                      controller: nombreController,
                      decoration: _inputDecoration('Nombre'),
                      validator: (v) => v!.isEmpty ? 'Requerido' : null),
                  const SizedBox(height: 14),
                  TextFormField(
                      controller: apellidoController,
                      decoration: _inputDecoration('Apellido'),
                      validator: (v) => v!.isEmpty ? 'Requerido' : null),
                  const SizedBox(height: 14),
                  TextFormField(
                      controller: telefonoController,
                      decoration: _inputDecoration('Teléfono'),
                      validator: (v) => v!.isEmpty ? 'Requerido' : null),
                  const SizedBox(height: 14),
                  TextFormField(
                      controller: direccionController,
                      decoration: _inputDecoration('Dirección'),
                      validator: (v) => v!.isEmpty ? 'Requerido' : null),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: codigoPostalController,
                    decoration: _inputDecoration('Código postal'),
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: departmentId,
                    decoration: _inputDecoration('Departamento'),
                    items: departments
                        .map((d) => DropdownMenuItem(
                            value: d['id'].toString(),
                            child: Text(d['nombre'])))
                        .toList(),
                    onChanged: (val) {
                      setState(() {
                        departmentId = val;
                        municipalities = [];
                        municipalityId = null;
                        neighborhoods = [];
                        neighborhoodId = null;
                      });
                      if (val != null) _fetchMunicipalities(val);
                    },
                    validator: (v) =>
                        v == null ? 'Seleccione un departamento' : null,
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: municipalityId,
                    decoration: _inputDecoration('Municipio'),
                    items: municipalities
                        .map((m) => DropdownMenuItem(
                            value: m['id'].toString(),
                            child: Text(m['nombre'])))
                        .toList(),
                    onChanged: (val) {
                      setState(() {
                        municipalityId = val;
                        neighborhoods = [];
                        neighborhoodId = null;
                      });
                      if (val != null) _fetchNeighborhoods(val);
                    },
                    validator: (v) =>
                        v == null ? 'Seleccione un municipio' : null,
                  ),
                  const SizedBox(height: 14),
                  DropdownButtonFormField<String>(
                    value: neighborhoodId,
                    decoration: _inputDecoration('Barrio'),
                    items: neighborhoods
                        .map((n) => DropdownMenuItem(
                            value: n['id'].toString(),
                            child: Text(n['nombre'])))
                        .toList(),
                    onChanged: (val) => setState(() => neighborhoodId = val),
                    validator: (v) => v == null ? 'Seleccione un barrio' : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: indicacionesController,
                    decoration: _inputDecoration('Indicaciones adicionales'),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 28),

                  // --- Botón con gradiente ---
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFFD95D85), Color(0xFFE58BB1)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        isEditing
                            ? 'Actualizar dirección'
                            : 'Guardar dirección',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
