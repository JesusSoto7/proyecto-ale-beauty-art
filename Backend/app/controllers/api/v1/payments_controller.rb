class Api::V1::PaymentsController < Api::V1::BaseController
  skip_before_action :verify_authenticity_token

  def create
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

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

    payment_response = sdk.payment.create(payment_data)
    payment = payment_response[:response]

    order = Order.find(params[:order_id])

    if payment["status"] == "approved"
      order.update(status: :pagada, fecha_pago: Time.current)
      InvoiceMailer.enviar_factura(order).deliver_later

      render json: {
        message: "Pago exitoso",
        payment: payment,
        order: order
      }, status: :ok
    else
      order.update(status: :cancelada)

      render json: {
        error: "Pago rechazado",
        payment: payment,
        order: order
      }, status: :unprocessable_entity
    end
  end
end
