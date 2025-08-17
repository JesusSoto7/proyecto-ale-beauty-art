class Api::V1::OrdersController < Api::V1::BaseController

  def create
    correo_cliente = current_user.email
    shipping_address = current_user.shipping_addresses.find_by(predeterminada: true)

    order = current_user.orders.build(
      correo_cliente: correo_cliente,
      status: :pendiente,
      pago_total: calcular_monto_actual.to_f,
      shipping_address: shipping_address
    )

    if order.save
      # copiar productos del carrito a la orden
      current_cart.cart_products.includes(:product).each do |item|
        order.order_details.create!(
          product: item.product,
          cantidad: item.cantidad,
          precio_unitario: item.product.precio_producto
        )
      end

      render json: {
        message: "Orden creada correctamente",
        order: order.as_json(include: { order_details: { include: :product } })
      }, status: :created
    else
      render json: {
        error: "Hubo un error al procesar la orden",
        details: order.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio_producto * item.cantidad
    end
  end
end
