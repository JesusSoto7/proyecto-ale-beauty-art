class NotificationMessage {
  final String title;
  final String message;
  final DateTime createdAt;

  NotificationMessage({
    required this.title,
    required this.message,
    required this.createdAt,
  });

  factory NotificationMessage.fromJson(Map<String, dynamic> json) {
    return NotificationMessage(
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}
