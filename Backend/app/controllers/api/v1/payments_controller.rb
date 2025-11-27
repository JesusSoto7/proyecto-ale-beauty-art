class Api::V1::PaymentsController < Api::V1::BaseController
  skip_before_action :authorize_request, only: [:create, :mobile_create]

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
      issuer_id: params[:issuer_id],
      payer: {
        email: params.dig(:payer, :email),
        identification: {
          type: params.dig(:payer, :identification, :type),
          number: params.dig(:payer, :identification, :number)
        }
      }
    }

    Rails.logger.info "🔹 Datos de pago enviados a MercadoPago: #{payment_data.inspect}"
    payment_response = sdk.payment.create(payment_data)

    if payment_response[:response].nil? || payment_response[:response].empty?
      Rails.logger.error "❌ Error en la respuesta de MercadoPago: #{payment_response.inspect}"
      render json: { error: "Error procesando el pago con MercadoPago", detail: payment_response }, status: :internal_server_error
      return
    end

    payment = payment_response[:response]
    Rails.logger.info "🔹 Respuesta de MercadoPago: #{payment_response.inspect}"

    order = Order.find(params[:order_id])

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

      if order.correo_cliente.blank?
        guest_email = params.dig(:payer, :email) || payment.dig("payer", "email")
        order.update_column(:correo_cliente, guest_email) if guest_email.present?
      end

      # Limpiar carrito backend del dueño de la orden
      begin
        if order.user&.cart
          order.user.cart.cart_products.destroy_all
        else
          current_user&.cart&.cart_products&.destroy_all
        end
      rescue => e
        Rails.logger.warn "No se pudo limpiar el carrito del usuario para la orden #{order.id}: #{e.message}"
      end

      # Enviar factura
      begin
        InvoiceMailer.enviar_factura(
          order,
          buyer_name: params[:buyer_name],
          buyer_phone: params[:buyer_phone],
          buyer_address: params[:buyer_address]
        ).deliver_later
      rescue => e
        Rails.logger.warn "No se pudo enviar la factura (web): #{e.message}"
      end

      redirect_url = "#{frontend_url}/#{params[:lang]}/checkout/success/#{payment['id']}"
      Rails.logger.info "🔹 URL generada para redirección: #{redirect_url}"
      
      render json: {
        message: "Pago exitoso",
        id: payment["id"],
        redirect_url: redirect_url,
        clear_guest_cart: order.user_id.nil?
      }, status: :ok
    else
      order.update(status: :cancelada)
      Rails.logger.warn "Pago rechazado. Detalles: #{payment['status_detail']}"
      render json: { error: "Pago rechazado", status: payment["status"], detail: payment["status_detail"] }, status: :unprocessable_entity
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
          { id: params[:order_id], title: "Compra en tu tienda", quantity: 1, unit_price: params[:transaction_amount].to_f }
        ]
      }
    }

    Rails.logger.info "🔹 payment_data: #{payment_data.inspect}"

    payment_response = sdk.payment.create(payment_data)
    payment = payment_response[:response]

    Rails.logger.info "🔹 MercadoPago Response: #{payment_response.inspect}"
    order = Order.find(params[:order_id])

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
      begin
        InvoiceMailer.enviar_factura(order).deliver_later
      rescue => e
        Rails.logger.warn "No se pudo enviar la factura (mobile): #{e.message}"
      end

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

  def find_pm_from_params
    if params[:payment_method_codigo].present?
      PaymentMethod.find_by(codigo: params[:payment_method_codigo], activo: true)
    elsif params[:payment_method_id].present?
      PaymentMethod.find_by(id: params[:payment_method_id], activo: true)
    end
  end
end