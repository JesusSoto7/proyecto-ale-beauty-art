class PaymentResponse {
  final String message;
  final String redirectUrl;

  PaymentResponse({
    required this.message,
    required this.redirectUrl,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      message: json['message'] ?? '',
      redirectUrl: json['redirect_url'] ?? '',
    );
  }
}
