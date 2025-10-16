import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

part 'chat_ia_event.dart';
part 'chat_ia_state.dart';

class ChatIaBloc extends Bloc<ChatIaEvent, ChatIaState> {
  ChatIaBloc() : super(ChatIaInitial()) {
    on<AddUserMessage>((event, emit) {
      final updated = List<Map<String, String>>.from(state.messages)
        ..add({'from': 'user', 'text': event.text});
      emit(ChatIaLoaded(messages: updated));
    });

    on<AddAIMessage>((event, emit) {
      final updated = List<Map<String, String>>.from(state.messages)
        ..add({'from': 'ai', 'text': event.text});
      emit(ChatIaLoaded(messages: updated));
    });

    on<ResetChat>((event, emit) {
      emit(ChatIaInitial());
    });
  }
}
