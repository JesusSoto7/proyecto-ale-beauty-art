import 'package:flutter/material.dart';
import 'package:ale_beauty_art_app/styles/colors.dart';

void showAppSnackBar(BuildContext context, String message, {int seconds = 2, Color? backgroundColor}) {
  final bg = backgroundColor ?? AppColors.primaryPink;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        message,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      backgroundColor: bg,
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 30),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 6,
      duration: Duration(seconds: seconds),
    ),
  );
}
