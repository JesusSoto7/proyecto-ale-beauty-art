part of 'navigation_bloc.dart';

abstract class NavigationState extends Equatable {
  const NavigationState();

  @override
  List<Object> get props => [];
}

class NavigationUpdated extends NavigationState {
  final int selectedIndex;

  const NavigationUpdated({required this.selectedIndex});

  @override
  List<Object> get props => [selectedIndex];
}
