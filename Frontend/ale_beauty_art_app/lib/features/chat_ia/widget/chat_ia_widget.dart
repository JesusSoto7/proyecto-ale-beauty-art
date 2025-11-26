import 'package:ale_beauty_art_app/features/chat_ia/service/ia_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/chat_ia/bloc/chat_ia_bloc.dart';
import 'package:ale_beauty_art_app/features/auth/bloc/auth_bloc.dart';
import 'package:ale_beauty_art_app/core/views/login_view.dart';
import 'package:ale_beauty_art_app/core/views/loading_view.dart';
import 'package:easy_localization/easy_localization.dart';

class ChatIAWidget extends StatefulWidget {
  const ChatIAWidget({super.key});

  @override
  State<ChatIAWidget> createState() => _ChatIAWidgetState();
}

class _ChatIAWidgetState extends State<ChatIAWidget>
    with SingleTickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  bool loading = false;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void enviarPregunta() async {
    final pregunta = _controller.text.trim();
    if (pregunta.isEmpty) return;

    // Require login: if not logged, navigate to login immediately
    final authState = context.read<AuthBloc>().state;
    if (authState is! AuthSuccess) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
      if (result != true) return; // user cancelled login
    }

    // Obtain token from AuthBloc if available
    final currentAuth = context.read<AuthBloc>().state;
    final String? token = currentAuth is AuthSuccess ? currentAuth.token : null;

    setState(() => loading = true);
    context.read<ChatIaBloc>().add(AddUserMessage(pregunta));
    _controller.clear();

    // Scroll automático
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });

    try {
      final aiResp = await getAIResponse(pregunta, authToken: token);
      if (mounted) {
        context.read<ChatIaBloc>().add(AddAIMessage(aiResp));
        setState(() => loading = false);

        await Future.delayed(const Duration(milliseconds: 100));
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      }
    } catch (e) {
      if (mounted) {
        context.read<ChatIaBloc>().add(AddAIMessage('${'chat.error_prefix'.tr()}: $e'));
        setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(24),
        topRight: Radius.circular(24),
      ),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        color: Colors.white,
        child: Column(
          children: [
            // 🎀 Header mejorado
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFFD95D85),
                    Color(0xFFE58BB1),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFD95D85).withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: SafeArea(
                bottom: false,
                child: Row(
                  children: [
                    // Avatar de Amélie
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.smart_toy_rounded,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Nombre y estado
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            "Amélie",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontSize: 18,
                            ),
                          ),
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF4CAF50),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                loading
                                    ? 'chat.status_typing'.tr()
                                    : 'chat.status_online'.tr(),
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Botón cerrar
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.close_rounded,
                            color: Colors.white),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // 💬 Chat body
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      const Color(0xFFFAFAFA),
                      Colors.grey[100]!,
                    ],
                  ),
                ),
                child: BlocBuilder<ChatIaBloc, ChatIaState>(
                  builder: (context, state) {
                    final messages = state.messages;

                    if (messages.isEmpty && !loading) {
                      return _buildEmptyState();
                    }

                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      itemCount: messages.length + (loading ? 1 : 0),
                      itemBuilder: (context, idx) {
                        if (loading && idx == messages.length) {
                          return Align(
                            alignment: Alignment.centerLeft,
                            child: ChatBubble(
                              text: 'chat.thinking'.tr(),
                              fromUser: false,
                              isLoading: true,
                            ),
                          );
                        }
                        final msg = messages[idx];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Align(
                            alignment: msg['from'] == 'user'
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: ChatBubble(
                              text: msg['text'] ?? '',
                              fromUser: msg['from'] == 'user',
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),

            // ⌨️ Input mejorado
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Container(
                        constraints: const BoxConstraints(maxHeight: 120),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAFAFA),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: _focusNode.hasFocus
                                ? const Color(0xFFD95D85).withOpacity(0.3)
                                : Colors.transparent,
                          ),
                        ),
                        child: TextField(
                          controller: _controller,
                          focusNode: _focusNode,
                          minLines: 1,
                          maxLines: 4,
                          enabled: !loading,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.black87,
                          ),
                          decoration: InputDecoration(
                            hintText: 'chat.input_hint'.tr(),
                            hintStyle: TextStyle(
                              color: Colors.grey[500],
                              fontSize: 15,
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 14,
                            ),
                            prefixIcon: Icon(
                              Icons.chat_bubble_outline_rounded,
                              color: Colors.grey[400],
                              size: 20,
                            ),
                          ),
                          textCapitalization: TextCapitalization.sentences,
                          onSubmitted: (_) => enviarPregunta(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Botón enviar
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: loading
                            ? null
                            : const LinearGradient(
                                colors: [
                                  Color(0xFFD95D85),
                                  Color.fromARGB(255, 238, 167, 196),
                                ],
                              ),
                        color: loading ? Colors.grey[300] : null,
                        shape: BoxShape.circle,
                        boxShadow: loading
                            ? null
                            : [
                                BoxShadow(
                                  color:
                                      const Color(0xFFD95D85).withOpacity(0.4),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(24),
                          onTap: loading ? null : enviarPregunta,
                          child: Center(
                            child: loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: LoadingIndicator(size: 20, color: Colors.white),
                                  )
                                : const Icon(
                                    Icons.send_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFFFFEEF3),
                  Color(0xFFFFF5F8),
                ],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              size: 64,
              color: Color(0xFFD95D85),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'chat.empty_title'.tr(),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'chat.empty_subtitle'.tr(),
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 32),
          // Sugerencias de preguntas
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                _SuggestionChip(
                  label: 'chat.suggestions.products'.tr(),
                  onTap: () {
                    _controller.text = 'chat.suggestions.products'.tr();
                    enviarPregunta();
                  },
                ),
                _SuggestionChip(
                  label: 'chat.suggestions.recommend'.tr(),
                  onTap: () {
                    _controller.text = 'chat.suggestions.recommend'.tr();
                    enviarPregunta();
                  },
                ),
                _SuggestionChip(
                  label: 'chat.suggestions.discounts'.tr(),
                  onTap: () {
                    _controller.text = 'chat.suggestions.discounts'.tr();
                    enviarPregunta();
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _SuggestionChip({
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFFFEEF3),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: const Color(0xFFD95D85).withOpacity(0.3),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.lightbulb_outline_rounded,
              size: 16,
              color: Color(0xFFD95D85),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFFD95D85),
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatBubble extends StatelessWidget {
  final String text;
  final bool fromUser;
  final bool isLoading;

  const ChatBubble({
    super.key,
    required this.text,
    this.fromUser = false,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment:
          fromUser ? MainAxisAlignment.end : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!fromUser) ...[
          // Avatar de Amélie
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(right: 8, top: 4),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFFD95D85),
                  Color(0xFFE58BB1),
                ],
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFD95D85).withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.auto_awesome_rounded,
                color: Colors.white,
                size: 16,
              ),
            ),
          ),
        ],
        Flexible(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.7,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: fromUser
                  ? const LinearGradient(
                      colors: [
                        Color(0xFFD95D85),
                        Color.fromARGB(255, 238, 167, 196),
                      ],
                    )
                  : null,
              color: fromUser
                  ? null
                  : (isLoading ? Colors.grey[200] : Colors.white),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft: Radius.circular(fromUser ? 20 : 4),
                bottomRight: Radius.circular(fromUser ? 4 : 20),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: isLoading
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _TypingIndicator(),
                      const SizedBox(width: 8),
                      Text(
                        text,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  )
                : fromUser
                    ? Text(
                        text,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          height: 1.4,
                        ),
                      )
                    : MarkdownBody(
                        data: text,
                        styleSheet: MarkdownStyleSheet(
                          p: const TextStyle(
                            color: Colors.black87,
                            fontSize: 15,
                            height: 1.5,
                          ),
                          strong: const TextStyle(
                            color: Color(0xFFD95D85),
                            fontWeight: FontWeight.bold,
                          ),
                          h1: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                          h2: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                          listBullet: const TextStyle(
                            color: Color(0xFFD95D85),
                          ),
                          code: TextStyle(
                            backgroundColor: Colors.grey[100],
                            color: const Color(0xFFD95D85),
                          ),
                        ),
                      ),
          ),
        ),
      ],
    );
  }
}

class _TypingIndicator extends StatefulWidget {
  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final value = (_controller.value - (index * 0.2)) % 1.0;
            final opacity = (1 - (value - 0.5).abs() * 2).clamp(0.3, 1.0);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: const Color(0xFFD95D85).withOpacity(opacity),
                shape: BoxShape.circle,
              ),
            );
          },
        );
      }),
    );
  }
}
