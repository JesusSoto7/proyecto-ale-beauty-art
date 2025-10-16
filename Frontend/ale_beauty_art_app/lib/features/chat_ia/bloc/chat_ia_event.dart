part of 'chat_ia_bloc.dart';

@immutable
sealed class ChatIaEvent {}

class AddUserMessage extends ChatIaEvent {
  final String text;
  AddUserMessage(this.text);
}

class AddAIMessage extends ChatIaEvent {
  final String text;
  AddAIMessage(this.text);
}

class ResetChat extends ChatIaEvent {}
