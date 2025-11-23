class SupportMailer < ApplicationMailer
  default from: "soporte.alebeauty@gmail.com"

  # Correo para el admin
  def admin_notification(message)
    
    @message = message
    
    admin_emails = ["soporte.alebeauty@gmail.com"]
    admin_user_emails = User.with_role(:admin).pluck(:email)
    
    all_admin_emails = (admin_emails + admin_user_emails).uniq
    
    mail(
      to: all_admin_emails, 
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

  def admin_reply(message, reply_content)
    @message = message
    @reply_content = reply_content
    
    # El correo se envía al cliente que originalmente creó el mensaje
    mail(
      to: @message.email,
      from: 'soporte.alebeauty@gmail.com', # ¡El correo de Admin!
      subject: "Respuesta a tu solicitud de soporte: #{@message.subject}"
    )
  end

end
