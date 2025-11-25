import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/features/favorites/presentation/bloc/favorite_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';

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
  bool? _optimisticFav;

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

      // Decide action based on the latest known bloc state (we'll read it now)
      final favState = context.read<FavoriteBloc>().state;
      final currentlyFav = favState is FavoriteSuccess && favState.favorites.any((f) => f.id == widget.productId);

      // Set optimistic flag so UI updates immediately
      if (mounted) setState(() => _optimisticFav = !currentlyFav);

      if (currentlyFav) {
        context.read<FavoriteBloc>().add(RemoveFavorite(widget.productId));
      } else {
        context.read<FavoriteBloc>().add(AddFavorite(widget.productId));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<FavoriteBloc, FavoriteState>(
      listener: (context, state) {
        if (state is FavoriteSuccess) {
          // Clear optimistic flag when real state arrives
          if (mounted) setState(() => _optimisticFav = null);
        }
      },
      builder: (context, state) {
        final bool isFavFromBloc = state is FavoriteSuccess && state.favorites.any((f) => f.id == widget.productId);
        final bool isFav = _optimisticFav ?? isFavFromBloc;

        return IconButton(
          icon: _busy
              ? SizedBox(
                  width: widget.size,
                  height: widget.size,
                  child: LoadingIndicator(size: widget.size),
                )
              : Icon(
                  isFav ? Icons.favorite : Icons.favorite_border,
                  color: isFav ? widget.activeColor : widget.inactiveColor,
                  size: widget.size,
                ),
          onPressed: _toggle,
          tooltip: isFav ? 'Quitar de favoritos' : 'Agregar a favoritos',
        );
      },
    );
  }
}
