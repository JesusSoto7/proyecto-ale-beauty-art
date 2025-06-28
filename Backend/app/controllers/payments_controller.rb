class PaymentsController < ApplicationController
  layout 'checkout'
  skip_before_action :verify_authenticity_token, only: [:create]
  skip_before_action :authenticate_user!, only: [:create]

  def new
  end

  def create
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    puts "======= PARÁMETROS RECIBIDOS ======="
    pp params.to_unsafe_h
    puts "Monto recibido: #{params[:transaction_amount]}"
    puts "===================================="

    payment_data = {
      transaction_amount: params[:transaction_amount].to_f,
      token: params[:token],
      description: params[:description] || "Pago",
      installments: params[:installments].to_i,
      payment_method_id: params[:payment_method_id],
      payer: {
        email: params.dig(:payer, :email),
        identification: {
          type: params.dig(:payer, :identification, :type),
          number: params.dig(:payer, :identification, :number)
        }
      }
    }

    puts "======= PAYMENT DATA ENVIADO A MERCADO PAGO ======="
    pp payment_data
    puts "==================================================="

    payment_response = sdk.payment.create(payment_data)
    payment = payment_response[:response]

    puts "======= RESPUESTA DE PAGO ======="
    pp payment_response
    puts "================================="

    if payment["status"] == "approved"
      order = Order.find(params[:order_id])
        puts "Orden actualizada exitosamente"
        render json: { redirect_url: pago_realizado_path(order.id) }
      else
        puts "Error al actualizar la orden:"
        pp order.errors.full_messages
        render json: { error: "No se pudo actualizar la orden", errores: order.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "El pago fue rechazado", detalles: payment_response[:response] }, status: :unprocessable_entity
    end
  end



end
