require 'mercadopago'

class OrdersController < ApplicationController
  layout 'checkout'
  skip_before_action :verify_authenticity_token, only: [:procesar_pago]
  def checkout_api

  end

  def procesar_pago
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    payment_data = {
      token: params[:token],
      transaction_amount: calcular_monto_actual,
      payment_method_id: params[:paymentMethodId],
      issuer_id: params[:issuer_id],
      installments: params[:installments].to_i,
      payer: {
        email: params[:cardholderEmail],
        identification: {
          type: params[:docType],
          number: params[:docNumber]
        }
      }
    }

    payment_response = sdk.payment_create(payment_data)
    payment = payment_response[:response]

    if payment[:status] == 'approved'
      order = Order.update(
        status: "pagado",
        pago_total: payment[:transaction_amount]
      )

    current_cart.cart_products.destroy_all

    redirect_to success_orders_path
    else
     redirect_to failure_orders_path, alert: "Error en el pago: #{payment[:status_detail]}"
    end
  end


  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio * item.cantidad
    end
  end

  def success
  end

  def failure
  end

  def pending
  end
end
