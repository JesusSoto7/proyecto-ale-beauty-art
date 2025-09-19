import 'dart:convert';
import 'package:ale_beauty_art_app/core/http/custom_http_client.dart';
import 'package:ale_beauty_art_app/models/ShippingAddress.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/shipping_address_bloc.dart';
import '../bloc/shipping_address_event.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

class ShippingAddressAdd extends StatefulWidget {
  final ShippingAddress? editAddress;
  const ShippingAddressAdd({super.key, this.editAddress});

  @override
  State<ShippingAddressAdd> createState() => _ShippingAddressFormPageState();
}

class _ShippingAddressFormPageState extends State<ShippingAddressAdd> {
  final _formKey = GlobalKey<FormState>();

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
    _fillForm();
    _fetchDepartments();
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
      final res = await CustomHttpClient.getRequest('/api/v1/locations/departments');
      if (res.statusCode == 200) setState(() => departments = jsonDecode(res.body));
    } catch (e) {}
  }

  Future<void> _fetchMunicipalities(String deptId) async {
    try {
      final res = await CustomHttpClient.getRequest('/api/v1/locations/municipalities/$deptId');
      if (res.statusCode == 200) setState(() => municipalities = jsonDecode(res.body));
    } catch (e) {}
  }

  Future<void> _fetchNeighborhoods(String munId) async {
    try {
      final res = await CustomHttpClient.getRequest('/api/v1/locations/neighborhoods/$munId');
      if (res.statusCode == 200) setState(() => neighborhoods = jsonDecode(res.body));
    } catch (e) {}
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      'shipping_address': {
        'nombre': nombreController.text,
        'apellido': apellidoController.text,
        'telefono': telefonoController.text,
        'direccion': direccionController.text,
        'codigo_postal': codigoPostalController.text,
        'indicaciones_adicionales': indicacionesController.text,
        'department_id': departmentId,
        'municipality_id': municipalityId,
        'neighborhood_id': neighborhoodId,
      }
    };

    try {
      final res = isEditing
          ? await CustomHttpClient.putRequest('/api/v1/shipping_addresses/${widget.editAddress!.id}', data)
          : await CustomHttpClient.postRequest('/api/v1/shipping_addresses', data);

      if (res.statusCode == 200 || res.statusCode == 201) {
        context.read<ShippingAddressBloc>().add(LoadAddresses());
        Navigator.pop(context);
      } else {
        final body = res.body.isNotEmpty ? jsonDecode(res.body) : {};
        final error = body['errors']?.join(', ') ?? body['message'] ?? 'Error desconocido';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $error')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: AppColors.primaryPink),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.primaryPink, width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!, width: 1),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 247, 246, 246),
      appBar: AppBar(
        title: Text(isEditing ? 'Editar dirección' : 'Nueva dirección'),
        backgroundColor: AppColors.primaryPink,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: nombreController,
                decoration: _inputDecoration('Nombre'),
                validator: (v) => v!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: apellidoController,
                decoration: _inputDecoration('Apellido'),
                validator: (v) => v!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: telefonoController,
                decoration: _inputDecoration('Teléfono'),
                validator: (v) => v!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: direccionController,
                decoration: _inputDecoration('Dirección'),
                validator: (v) => v!.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: codigoPostalController,
                decoration: _inputDecoration('Código postal'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: indicacionesController,
                decoration: _inputDecoration('Indicaciones adicionales'),
                maxLines: 3,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: departmentId,
                decoration: _inputDecoration('Departamento'),
                items: departments
                    .map((d) => DropdownMenuItem(value: d['id'].toString(), child: Text(d['nombre'])))
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
                validator: (v) => v == null ? 'Seleccione un departamento' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: municipalityId,
                decoration: _inputDecoration('Municipio'),
                items: municipalities
                    .map((m) => DropdownMenuItem(value: m['id'].toString(), child: Text(m['nombre'])))
                    .toList(),
                onChanged: (val) {
                  setState(() {
                    municipalityId = val;
                    neighborhoods = [];
                    neighborhoodId = null;
                  });
                  if (val != null) _fetchNeighborhoods(val);
                },
                validator: (v) => v == null ? 'Seleccione un municipio' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: neighborhoodId,
                decoration: _inputDecoration('Barrio'),
                items: neighborhoods
                    .map((n) => DropdownMenuItem(value: n['id'].toString(), child: Text(n['nombre'])))
                    .toList(),
                onChanged: (val) => setState(() => neighborhoodId = val),
                validator: (v) => v == null ? 'Seleccione un barrio' : null,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryPink,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(isEditing ? 'Actualizar' : 'Guardar', style: const TextStyle(color: Colors.white, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
