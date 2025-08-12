import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

class ExpandableSearchBar extends StatefulWidget {
  const ExpandableSearchBar({super.key});

  @override
  State<ExpandableSearchBar> createState() => _ExpandableSearchBarState();
}

class _ExpandableSearchBarState extends State<ExpandableSearchBar> {
  bool _isExpanded = false;
  final FocusNode _focusNode = FocusNode();
  final TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus) {
        setState(() => _isExpanded = false); // se cierra cuando pierde el foco
      }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      width: _isExpanded ? 250 : 40, // ancho dinámico
      height: 36,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(Icons.search, color: AppColors.primaryPink),
            onPressed: () {
              setState(() {
                _isExpanded = true;
              });
              Future.delayed(const Duration(milliseconds: 100), () {
                FocusScope.of(context).requestFocus(_focusNode);
              });
            },
            padding: EdgeInsets.zero,
          ),
          if (_isExpanded)
            Expanded(
              child: TextField(
                focusNode: _focusNode,
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: 'Buscar...',
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding: EdgeInsets.symmetric(vertical: 5),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
