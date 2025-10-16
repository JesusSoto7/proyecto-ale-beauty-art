import 'package:flutter/material.dart';
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
        setState(() => _isExpanded = false);
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
    // Colores inspirados en la imagen proporcionada
    const Color pastelRose = Color(0xFFFFEEF3);

    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Row(
        mainAxisAlignment:
            MainAxisAlignment.start, // Alinea a la izquierda como en la imagen
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            width: _isExpanded ? 290 : 48,
            height: 36,
            decoration: BoxDecoration(
              color: pastelRose,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.pink.withOpacity(0.09),
                  blurRadius: 8,
                  offset: const Offset(0, 1),
                ),
              ],
              border: Border.all(
                color: Colors.white.withOpacity(0.7),
                width: 1.2,
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(Icons.search,
                      color: AppColors.primaryPink, size: 22),
                  onPressed: () {
                    setState(() {
                      _isExpanded = true;
                    });
                    Future.delayed(const Duration(milliseconds: 100), () {
                      FocusScope.of(context).requestFocus(_focusNode);
                    });
                  },
                  padding: EdgeInsets.zero,
                  splashRadius: 20,
                ),
                if (_isExpanded)
                  Expanded(
                    child: TextField(
                      focusNode: _focusNode,
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'Search product',
                        hintStyle: TextStyle(
                          color: Color(0xFFD95D85),
                          fontSize: 15.5,
                          fontWeight: FontWeight.w400,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                      ),
                      style: const TextStyle(
                        color: Color(0xFF222222),
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
