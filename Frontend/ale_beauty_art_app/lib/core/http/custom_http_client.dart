import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';

class CustomHttpClient {
  static http.Client get client {
    if (kIsWeb) {
      return http.Client();
    } else {
      final ioClient = HttpClient()
        ..badCertificateCallback = (cert, host, port) => true;

      return IOClient(ioClient);
    }
  }
}
