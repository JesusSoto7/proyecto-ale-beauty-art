class OrdersController < ApplicationController
  def create
    correo_cliente = current_user.present? ? current_user.email : params[:email]
    shipping_address = current_user.shipping_addresses.find_by(predeterminada: true)

    order = Order.new(
      user: current_user,
      correo_cliente: correo_cliente,
      status: :pendiente,
      pago_total: calcular_monto_actual.to_f,
      shipping_address: shipping_address
    )

    if order.save
      current_cart.cart_products.includes(:product).each do |item|
        order.order_details.create(
          product: item.product,
          cantidad: item.cantidad,
          precio_unitario: item.product.precio_producto,
        )
      end

      session[:order_id] = order.id

      if shipping_address
        redirect_to direccion_envio_checkout_path(order)
      else
        redirect_to direccion_envio_checkout_path(order), alert: "Agrega una dirección para continuar con tu compra."
      end
    else
      redirect_to current_cart_path, alert: "Hubo un error al procesar la orden: #{order.errors.full_messages.to_sentence}"
    end
  end

  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio_producto * item.cantidad
    end
  end
end
