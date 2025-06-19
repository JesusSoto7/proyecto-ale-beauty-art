class OrdersController < ApplicationController

  def create
    correo_cliente = current_user.present? ? current_user.email : params[:email]

    order = Order.create(
      user: current_user,
      correo_cliente: correo_cliente,
      status: :pendiente,
      pago_total: calcular_monto_actual.to_f
    )

    current_cart.cart_products.includes(:product).each do |item|
      order.order_details.create(
        product: item.product,
        cantidad: item.cantidad,
        precio_unitario: item.product.precio_producto
      )

    end

    session[:order_id] = order.id
    redirect_to new_checkouts_path
  end

  private

  def calcular_monto_actual
    current_cart.cart_products.includes(:product).sum do |item|
      item.product.precio_producto * item.cantidad
    end
  end

end
