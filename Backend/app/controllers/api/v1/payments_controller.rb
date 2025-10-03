class Api::V1::PaymentsController < Api::V1::BaseController

  def create
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])
    frontend_url = ENV['FRONTEND_URL'].presence || "https://localhost:3000"

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
      current_user.cart.cart_products.destroy_all
      InvoiceMailer.enviar_factura(order).deliver_later

      render json: {
        message: "Pago exitoso",
        redirect_url: "#{frontend_url}/#{params[:lang]}/checkout/success/#{payment['id']}"
      }, status: :ok
    else
      order.update(status: :cancelada)

      render json: {
        error: "Pago rechazado",
        redirect_url: "#{ENV['FRONTEND_URL']}/#{params[:lang]}/checkout/failure/#{payment['id']}"
      }, status: :unprocessable_entity
    end
  end

  def mobile_create
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    payment_data = {
      transaction_amount: params[:transaction_amount].to_f,
      token: params[:token], # viene de Flutter ya tokenizado
      description: params[:description] || "Pago desde app móvil",
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

    if payment["status"] == "approved"
      render json: { status: "approved", id: payment["id"] }, status: :ok
    else
      render json: { status: payment["status"], detail: payment["status_detail"] }, status: :unprocessable_entity
    end
  end

end
