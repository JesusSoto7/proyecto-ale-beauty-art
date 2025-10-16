part of 'chat_ia_bloc.dart';

@immutable
sealed class ChatIaState {
  final List<Map<String, String>> messages;
  ChatIaState({required this.messages});
}

final class ChatIaInitial extends ChatIaState {
  ChatIaInitial()
      : super(messages: [
          {
            'from': 'ai',
            'text':
                '¡Hola! Soy Amélie, tu asistente de belleza. ¿En qué puedo ayudarte hoy?'
          }
        ]);
}

final class ChatIaLoaded extends ChatIaState {
  ChatIaLoaded({required List<Map<String, String>> messages})
      : super(messages: messages);
}
