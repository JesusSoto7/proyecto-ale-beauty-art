import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Botón reutilizable para marcar/quitar favorito.
/// Se guía por la implementación de ProductDetailView.
class FavoriteToggleButton extends StatefulWidget {
  final int productId;
  final Color activeColor;
  final Color inactiveColor;
  final double size;

  const FavoriteToggleButton({
    super.key,
    required this.productId,
    this.activeColor = const Color(0xFFD95D85),
    this.inactiveColor = Colors.grey,
    this.size = 22,
  });

  @override
  State<FavoriteToggleButton> createState() => _FavoriteToggleButtonState();
}

class _FavoriteToggleButtonState extends State<FavoriteToggleButton> {
  bool _busy = false;
  bool _isFav = false;

  @override
  void initState() {
    super.initState();
    // Inicializar estado local desde FavoriteBloc si ya está cargado
    final favState = context.read<FavoriteBloc>().state;
    if (favState is FavoriteSuccess) {
      _isFav = favState.favorites.any((f) => f.id == widget.productId);
    }
  }

  Future<void> _toggle() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final authState = context.read<AuthBloc>().state;
      if (authState is! AuthSuccess) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const LoginPage()),
        );
        if (result != true) {
          setState(() => _busy = false);
          return;
        }
      }

      final auth = context.read<AuthBloc>().state as AuthSuccess;
      context.read<FavoriteBloc>().add(UpdateFavoriteToken(auth.token));

      if (_isFav) {
        context.read<FavoriteBloc>().add(RemoveFavorite(widget.productId));
      } else {
        context.read<FavoriteBloc>().add(AddFavorite(widget.productId));
      }
      if (mounted) setState(() => _isFav = !_isFav);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: _busy
          ? SizedBox(
              width: widget.size,
              height: widget.size,
              child: const CircularProgressIndicator(strokeWidth: 2),
            )
          : Icon(
              _isFav ? Icons.favorite : Icons.favorite_border,
              color: _isFav ? widget.activeColor : widget.inactiveColor,
              size: widget.size,
            ),
      onPressed: _toggle,
      tooltip: _isFav ? 'Quitar de favoritos' : 'Agregar a favoritos',
    );
  }
}
