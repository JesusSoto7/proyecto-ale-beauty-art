import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

class ProfileAccountView extends StatefulWidget {
  const ProfileAccountView({super.key});

  @override
  State<ProfileAccountView> createState() => _ProfileAccountViewState();
}

class _ProfileAccountViewState extends State<ProfileAccountView> {
  final _nombreCtrl = TextEditingController();
  final _apellidoCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _telefonoCtrl = TextEditingController();
  bool _saving = false;
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthSuccess) {
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        final res = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginPage()),
        );
        if (res != true) {
          if (mounted) Navigator.pop(context);
          return;
        }
        final s2 = context.read<AuthBloc>().state;
        if (s2 is AuthSuccess) _populateFromUser(s2.user);
      });
    } else {
      _populateFromUser(authState.user);
    }
  }

  void _populateFromUser(Map<String, dynamic> user) {
    _nombreCtrl.text = (user['nombre'] ?? '').toString();
    _apellidoCtrl.text = (user['apellido'] ?? '').toString();
    _emailCtrl.text = (user['email'] ?? '').toString();
    _telefonoCtrl.text = (user['telefono'] ?? user['phone'] ?? '').toString();
  }

  Future<void> _onSave() async {
    setState(() => _saving = true);
    context.read<AuthBloc>().add(UpdateProfileSubmitted(
          nombre: _nombreCtrl.text.trim(),
          apellido: _apellidoCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          telefono: _telefonoCtrl.text.trim().isEmpty ? null : _telefonoCtrl.text.trim(),
        ));
  }

  void _onLogout() {
    context.read<AuthBloc>().add(LogoutRequested());
    Navigator.popUntil(context, (route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthSuccess) {
          setState(() {
            _saving = false;
            _editing = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'profile.updated_success'.tr(),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              backgroundColor: const Color(0xFFD95D85),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.fromLTRB(20, 0, 20, 30),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 6,
              duration: const Duration(seconds: 1),
            ),
          );
        } else if (state is AuthFailure) {
          setState(() => _saving = false);
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.message)));
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F5F7),
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.20),
                  blurRadius: 12,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              centerTitle: true,
              leading: IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 20,
                  color: Colors.black87,
                ),
                onPressed: () => Navigator.pop(context),
              ),
              title: Text(
                'profile.my_account'.tr(),
                style: const TextStyle(color: Color.fromARGB(255, 0, 0, 0), fontSize: 18, fontWeight: FontWeight.w600),
              ),
              systemOverlayStyle: const SystemUiOverlayStyle(
                statusBarIconBrightness: Brightness.light,
                statusBarBrightness: Brightness.dark,
              ),
            ),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: _editing ? _buildEditView() : _buildDisplayView(),
        ),
      ),
    );
  }

  Widget _buildDisplayView() {
    final user = (context.read<AuthBloc>().state is AuthSuccess) ? (context.read<AuthBloc>().state as AuthSuccess).user : null;
    final nombre = user != null ? (user['nombre'] ?? '').toString() : '';
    final apellido = user != null ? (user['apellido'] ?? '').toString() : '';
    final email = user != null ? (user['email'] ?? '').toString() : '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.accentPink.withOpacity(0.35),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 48,
            backgroundColor: AppColors.primaryPink,
            child: Text(
              (nombre.isNotEmpty ? nombre[0] : 'U').toUpperCase(),
              style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          '$nombre ${apellido}',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Text(email, style: const TextStyle(color: Colors.black54)),
        if (email.isNotEmpty) const SizedBox(height: 6),
        if ((_getPhoneFromUser(context) ?? '').isNotEmpty) Text((_getPhoneFromUser(context) ?? ''), style: const TextStyle(color: Colors.black54)),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _editing = true;
                    _populateFromUser(user ?? {});
                  });
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
                child: Text('profile.edit'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton(
                onPressed: _onLogout,
                style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                child: Text('profile.logout'.tr(), style: const TextStyle(color: Colors.red)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String? _getPhoneFromUser(BuildContext context) {
    final user = (context.read<AuthBloc>().state is AuthSuccess) ? (context.read<AuthBloc>().state as AuthSuccess).user : null;
    return user != null ? (user['telefono'] ?? user['phone'] ?? '').toString() : null;
  }

  Widget _buildEditView() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          Text('profile.details'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ProfileEditForm(
            nombreController: _nombreCtrl,
            apellidoController: _apellidoCtrl,
            emailController: _emailCtrl,
            telefonoController: _telefonoCtrl,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _saving ? null : () {
                    _onSave();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryPink),
                  child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text('common.save'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => setState(() => _editing = false),
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.black87),
                  child: Text('common.cancel'.tr(), style: const TextStyle(color: Colors.black87)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // while editing we don't show logout here (cancel only)
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _apellidoCtrl.dispose();
    _emailCtrl.dispose();
    _telefonoCtrl.dispose();
    super.dispose();
  }
}

class ProfileEditForm extends StatelessWidget {
  final TextEditingController nombreController;
  final TextEditingController apellidoController;
  final TextEditingController emailController;
  final TextEditingController telefonoController;

  const ProfileEditForm({
    Key? key,
    required this.nombreController,
    required this.apellidoController,
    required this.emailController,
    required this.telefonoController,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          TextField(
            controller: nombreController,
            decoration: InputDecoration(
              labelText: 'profile.first_name'.tr(),
              prefixIcon: const Icon(Icons.person),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: apellidoController,
            decoration: InputDecoration(
              labelText: 'profile.last_name'.tr(),
              prefixIcon: const Icon(Icons.person_outline),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: emailController,
            decoration: InputDecoration(
              labelText: 'profile.email'.tr(),
              prefixIcon: const Icon(Icons.email_outlined),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: telefonoController,
            decoration: InputDecoration(
              labelText: 'profile.phone'.tr(),
              prefixIcon: const Icon(Icons.phone),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
            keyboardType: TextInputType.phone,
          ),
        ],
      ),
    );
  }
}
