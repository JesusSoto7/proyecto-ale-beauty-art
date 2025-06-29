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

    order = Order.find(params[:order_id])
    if payment["status"] == "approved"
      order.update(status: :pagada,  fecha_pago: Time.current)
      puts "Orden actualizada exitosamente"
      InvoiceMailer.enviar_factura(order).deliver_now

      render json: {
        message: "Pago exitoso y factura enviada",
        redirect_url: pago_realizado_path(order.id, payment_id: payment["id"])
      }
    else
      order.update(status: :cancelada)
      puts "Orden marcada como cancelada"
       render json: {
        error: "Pago rechazado",
        redirect_url: pago_cancelado_path(order.id, payment_id: payment["id"])
      }, status: :unprocessable_entity
    end

  end



end
