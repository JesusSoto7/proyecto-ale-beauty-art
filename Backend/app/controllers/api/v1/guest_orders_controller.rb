module Api
  module V1
    class GuestOrdersController < Api::V1::BaseController
      # Público: permite crear órdenes sin token
      skip_before_action :authorize_request, only: [:create]

      def create
        items = guest_order_params[:products] || []
        return render json: { error: "Sin productos" }, status: :unprocessable_entity if items.blank?

        order = Order.new(
          user_id: nil,
          status: :pendiente,
          pago_total: 0,
          costo_de_envio: 10_000,
          correo_cliente: guest_order_params.dig(:customer, :email)
        )

        total_productos = 0
        iva_total = 0
        items.each do |it|
          product = Product.find(it[:product_id])
          qty     = (it[:quantity] || 1).to_i
          # Usa solo los métodos de Product
          price   = product.precio_con_mejor_descuento

          total_productos += price * qty
          iva_total += product.iva_amount(price) * qty
          order.order_details.build(
            product: product,
            cantidad: qty,
            precio_unitario: price
          )
        end

        envio = order.costo_de_envio || 0
        total_con_iva = total_productos + iva_total + envio

        if order.save
          render json: {
            order: {
              id: order.id,
              subtotal_sin_iva: total_productos,
              iva_total: iva_total,
              envio: envio,
              total: total_con_iva
            }
          }, status: :ok
        else
          render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      # Espera: { order: { customer: {name,email,phone,address}, products:[{product_id,quantity}] } }
      def guest_order_params
        params.require(:order).permit(
          customer: [:name, :email, :phone, :address],
          products: [:product_id, :quantity]
        )
      end
    end
  end
end