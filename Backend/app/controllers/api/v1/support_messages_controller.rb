class Api::V1::SupportMessagesController < ApplicationController
  protect_from_forgery with: :null_session
  skip_before_action :authenticate_user!, only: [:create, :index, :reply, :pending_count]
  # before_action :authenticate_user!, only: [:index, :reply, :pending_count]
  
  def index
    @messages = SupportMessage.order(created_at: :desc)
    render json: @messages
  end

  def create
    @message = SupportMessage.new(support_message_params)

    if @message.save
      SupportMailer.admin_notification(@message).deliver_later
      SupportMailer.user_confirmation(@message).deliver_later
      render json: { message: "Mensaje enviado correctamente" }, status: :created
    else
      render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def reply
    @message = SupportMessage.find(params[:id])
    reply_content = params[:reply_content]

    if reply_content.blank?
      render json: { error: "El contenido de la respuesta no puede estar vacío" }, status: :unprocessable_entity
      return
    end

    SupportMailer.admin_reply(@message, reply_content).deliver_later

    @message.update(replied: true)

    render json: { message: "Respuesta enviada correctamente" }, status: :ok

  rescue ActiveRecord::RecordNotFound
    render json: { error: "Mensaje no encontrado" }, status: :not_found
  end

  def pending_count
    # Cuenta los mensajes donde la columna 'replied' es false
    count = SupportMessage.where(replied: false).count
    
    render json: { pending_count: count }, status: :ok
  end

  private

  def support_message_params
    params.require(:support_message).permit(:name, :last_name, :email, :subject, :message_text)
  end
end