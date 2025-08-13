import 'package:intl/intl.dart';

/// Formato para pesos colombiano 
final _decimalFormatCOP = NumberFormat.decimalPattern('es_CO');

/// Devuelve el precio en el formato
String formatPriceCOP(num price) {
  return '\$${_decimalFormatCOP.format(price)} COP';
}

