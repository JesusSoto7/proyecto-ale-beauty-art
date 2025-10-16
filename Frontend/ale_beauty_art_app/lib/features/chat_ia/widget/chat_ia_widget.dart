import 'package:ale_beauty_art_app/features/chat_ia/service/ia_api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:ale_beauty_art_app/features/chat_ia/bloc/chat_ia_bloc.dart';

class ChatIAWidget extends StatefulWidget {
  @override
  State<ChatIAWidget> createState() => _ChatIAWidgetState();
}

class _ChatIAWidgetState extends State<ChatIAWidget> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool loading = false;

  void enviarPregunta() async {
    final pregunta = _controller.text.trim();
    if (pregunta.isEmpty) return;
    setState(() {
      loading = true;
    });
    context.read<ChatIaBloc>().add(AddUserMessage(pregunta));
    _controller.clear();

    try {
      final aiResp = await getAIResponse(pregunta);
      context.read<ChatIaBloc>().add(AddAIMessage(aiResp));
      setState(() {
        loading = false;
      });
      await Future.delayed(Duration(milliseconds: 100));
      _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
    } catch (e) {
      context.read<ChatIaBloc>().add(AddAIMessage('Ocurrió un error: $e'));
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.7,
      child: Column(
        children: [
          // Header...
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 12),
            child: Row(
              children: [
                Text(
                  "Amélie",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFD95D85),
                    fontSize: 20,
                  ),
                ),
                Spacer(),
                IconButton(
                  icon: Icon(Icons.close, color: Colors.grey[700]),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          Divider(height: 1),
          // Chat body
          Expanded(
            child: Container(
              color: Colors.grey[100],
              child: BlocBuilder<ChatIaBloc, ChatIaState>(
                builder: (context, state) {
                  final messages = state.messages;
                  return ListView.builder(
                    controller: _scrollController,
                    padding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                    itemCount: messages.length + (loading ? 1 : 0),
                    itemBuilder: (context, idx) {
                      if (loading && idx == messages.length) {
                        return Align(
                          alignment: Alignment.centerLeft,
                          child: ChatBubble(
                            text: "Amélie está escribiendo...",
                            fromUser: false,
                            isLoading: true,
                          ),
                        );
                      }
                      final msg = messages[idx];
                      return Align(
                        alignment: msg['from'] == 'user'
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: ChatBubble(
                          text: msg['text'] ?? '',
                          fromUser: msg['from'] == 'user',
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ),
          // Input...
          SafeArea(
            child: Container(
              padding: EdgeInsets.only(left: 12, right: 12, bottom: 12, top: 8),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      minLines: 1,
                      maxLines: 4,
                      decoration: InputDecoration(
                          hintText: "Escribe tu pregunta...",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                          fillColor: Colors.grey[200],
                          filled: true,
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8)),
                      enabled: !loading,
                      onSubmitted: (_) => enviarPregunta(),
                    ),
                  ),
                  SizedBox(width: 8),
                  IconButton(
                    icon: Icon(Icons.send, color: Color(0xFFD95D85)),
                    onPressed: loading ? null : enviarPregunta,
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ChatBubble extends StatelessWidget {
  final String text;
  final bool fromUser;
  final bool isLoading;
  const ChatBubble(
      {required this.text, this.fromUser = false, this.isLoading = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints:
          BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
      margin: EdgeInsets.symmetric(vertical: 4),
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isLoading
            ? Colors.grey[300]
            : fromUser
                ? Color(0xFFFFEEF3)
                : Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
          bottomLeft: Radius.circular(fromUser ? 16 : 2),
          bottomRight: Radius.circular(fromUser ? 2 : 16),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 2,
            offset: Offset(0, 1),
          )
        ],
      ),
      child: isLoading
          ? Text(
              text,
              style: TextStyle(
                color: Colors.black87,
                fontStyle: FontStyle.italic,
              ),
            )
          : fromUser
              ? Text(
                  text,
                  style: TextStyle(
                    color: Colors.black87,
                  ),
                )
              : MarkdownBody(
                  data: text,
                  styleSheet: MarkdownStyleSheet(
                    p: TextStyle(color: Colors.black87),
                    strong: TextStyle(color: Color(0xFFD95D85)),
                    h1: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    h2: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    listBullet: TextStyle(color: Colors.black87),
                  ),
                ),
    );
  }
}
