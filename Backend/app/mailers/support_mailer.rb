class SupportMailer < ApplicationMailer
  default from: "soporte.alebeauty@gmail.com"

  # Correo para el admin
  def admin_notification(message)
    @message = message
    mail(
      to: "soporte.alebeauty@gmail.com",
      subject: "Nuevo mensaje de soporte recibido"
    )
  end

  # Correo para confirmar al usuario
  def user_confirmation(message)
    @message = message
    mail(
      to: @message.email,
      subject: "Tu mensaje fue recibido - Ale Beauty Art"
    )
  end
end
