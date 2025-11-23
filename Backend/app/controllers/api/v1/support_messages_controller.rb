class Api::V1::SupportMessagesController < ApplicationController
  protect_from_forgery with: :null_session
  skip_before_action :authenticate_user!, only: [:create]
  # before_action :authenticate_user!, only: [:index]


  def index
    @messages = SupportMessage.order(created_at: :desc)
    render json: @messages
  end


  def create
    @message = SupportMessage.new(support_message_params)

    if @message.save
      # Enviar correo al administrador
      SupportMailer.admin_notification(@message).deliver_later

      # Enviar correo al usuario
      SupportMailer.user_confirmation(@message).deliver_later

      render json: { message: "Mensaje enviado correctamente" }, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end


  private

  def support_message_params
    params.require(:support_message).permit(:name, :last_name, :email, :subject, :message_text)
  end
end
