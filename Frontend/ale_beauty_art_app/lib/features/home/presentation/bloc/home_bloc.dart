import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:http/http.dart' as http;

part 'home_event.dart';
part 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc() : super(HomeInitial()) {
    on<HomeVerProductosPressed>((event, emit) async {
      final url = Uri.parse('https://run.mocky.io/v3/a25241ce-0c33-4bb9-9cc5-2d9574e9fd0e');
      final response = await http.get(url);
      if (response.statusCode == 200) {
        emit(HomeLoadFailure());
      }
    });
  }
}
