import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:http/http.dart' as http;

part 'home_event.dart';
part 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc() : super(HomeInitial()) {
    on<HomeVerProductsPressed>((event, emit) async {
      final url = Uri.parse('https://jsonplaceholder.typicode.com/posts/1');
      final response = await http.get(url);
      if (response.statusCode == 200) {
        emit(HomeLoadFailure());
      } else {
        emit(HomeLoadFailure());
      }
    });
  }
}
