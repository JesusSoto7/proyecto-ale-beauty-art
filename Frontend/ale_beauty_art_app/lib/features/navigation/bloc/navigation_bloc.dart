import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

part 'navigation_event.dart';
part 'navigation_state.dart';

class NavigationBloc extends Bloc<NavigationEvent, NavigationState> {
  NavigationBloc() : super(NavigationUpdated(selectedIndex: 0)) {
    on<NavigationTabChanged>((event, emit) {
      emit(NavigationUpdated(selectedIndex: event.index));
    });
  }
}
