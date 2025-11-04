class Api::V1::PaymentsController < Api::V1::BaseController
  skip_before_action :authorize_request, only: [:mobile_create]

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

    # Asegurar que la orden tenga el método de pago
    if order.payment_method.blank?
      if (pm = find_pm_from_params || PaymentMethod.find_by(codigo: 'mercadopago', activo: true))
        order.update(payment_method: pm)
      end
    end

    if payment["status"] == "approved"
      order.update(
        status: :pagada,
        fecha_pago: Time.current,
        payment_id: payment["id"],
        card_type: payment.dig("payment_method_id"),
        card_last4: payment.dig("card", "last_four_digits")
      )
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
    require 'mercadopago'
    sdk = Mercadopago::SDK.new(ENV['MERCADOPAGO_ACCESS_TOKEN'])

    payment_data = {
      transaction_amount: params[:transaction_amount].to_f,
      token: params[:token],
      description: "Pago",
      installments: params[:installments],
      payment_method_id: params[:payment_method_id],
      payer: {
        email: params[:payer][:email],
        identification: {
          type: params[:payer][:identification][:type],
          number: params[:payer][:identification][:number]
        }
      },
      additional_info: {
        ip_address: request.remote_ip,
        items: [
          {
            id: params[:order_id],
            title: "Compra en tu tienda",
            quantity: 1,
            unit_price: params[:transaction_amount].to_f
          }
        ]
      }
    }

    Rails.logger.info "🔹 payment_data: #{payment_data.inspect}"

    payment_response = sdk.payment.create(payment_data)
    payment = payment_response[:response]

    Rails.logger.info "🔹 MercadoPago Response: #{payment_response.inspect}"
    order = Order.find(params[:order_id])

    # Establecer/actualizar el método de pago de la orden
    begin
      pm = find_pm_from_params || PaymentMethod.find_by(codigo: 'mercadopago', activo: true)
      order.update(payment_method: pm) if pm && order.payment_method_id != pm.id
    rescue => e
      Rails.logger.warn "No se pudo asociar PaymentMethod a la orden: #{e.message}"
    end

    if payment["status"] == "approved"
      order.update(
        status: :pagada,
        fecha_pago: Time.current,
        payment_id: payment["id"],
        card_type: payment.dig("payment_method_id"),
        card_last4: payment.dig("card", "last_four_digits")
      )
      order.user.cart.cart_products.destroy_all if order.user&.cart
      # InvoiceMailer.enviar_factura(order).deliver_later

      render json: {
        status: payment["status"],
        detail: payment["status_detail"],
        id: payment["id"],
        message: "Pago exitoso"
      }, status: :ok
    else
      order.update(status: :cancelada)

      render json: {
        status: payment["status"],
        detail: payment["status_detail"],
        error: "Pago rechazado"
      }, status: :unprocessable_entity
    end
  end

  private

  # Reutilizable: resuelve el método de pago desde los params
  def find_pm_from_params
    if params[:payment_method_codigo].present?
      PaymentMethod.find_by(codigo: params[:payment_method_codigo], activo: true)
    elsif params[:payment_method_id].present?
      PaymentMethod.find_by(id: params[:payment_method_id], activo: true)
    end
  end
end