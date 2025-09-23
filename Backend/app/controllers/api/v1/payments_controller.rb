class Api::V1::PaymentsController < Api::V1::BaseController

  def create_preference
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    order = current_user.orders.find(params[:order_id])

    preference_data = {
      items: [
        {
          title: "Orden #{order.numero_de_orden}",
          quantity: 1,
          currency_id: 'COP',
          unit_price: order.pago_total.to_f
        }
      ],
      back_urls: {
        success: "#{ENV['FRONTEND_URL']}/checkout/success",
        failure: "#{ENV['FRONTEND_URL']}/checkout/failure",
        pending: "#{ENV['FRONTEND_URL']}/checkout/pending"
      },
      auto_return: 'approved'
    }

    preference = sdk.preference.create(preference_data)
    render json: { init_point: preference[:response]['init_point'] }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

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
end
