module Api
  module V1
    class CartController < Api::V1::BaseController
      def show
        # Si no hay usuario autenticado, devolver un carrito vacío para modo invitado
        unless current_user
          return render json: { id: nil, products: [] }
        end

        cart = current_user.cart || current_user.create_cart
        render json: cart_json(cart)
      end

      def add_product
        cart = current_user.cart || current_user.create_cart
        product = Product.find(params[:product_id])

        cart_product = cart.cart_products.find_or_initialize_by(product: product)
        cart_product.cantidad ||= 0
        cart_product.cantidad += 1

        if cart_product.cantidad > product.stock
          return render json: {
            error: "Stock insuficiente para el producto #{product.nombre_producto}",
            cart: cart_json(cart)
          }, status: :unprocessable_entity
        end

        if cart_product.save
          render json: { message: "Producto añadido", cart: cart_json(cart) }
        else
          render json: { errors: cart_product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def remove_product
        cart = current_user.cart
        return render json: { error: "Carrito no encontrado" }, status: :not_found unless cart

        cart_product = cart.cart_products.find_by(product_id: params[:product_id])
        return render json: { error: "Producto no encontrado en el carrito" }, status: :not_found unless cart_product

        if cart_product.cantidad > 1
          cart_product.cantidad -= 1
          cart_product.save
        else
          cart_product.destroy
        end

        render json: { message: "Producto eliminado", cart: cart_json(cart) }
      end

      private

      def cart_json(cart)
        products = cart.cart_products.includes(product: [:discount]).map do |cp|
          product = cp.product
          mejor_descuento = product.mejor_descuento_para_precio(product.precio_producto)
          precio_con_descuento = product.precio_con_mejor_descuento(product.precio_producto)
          cantidad = cp.cantidad.to_i

          subtotal_line = precio_con_descuento.to_f * cantidad
          iva_line = product.iva_amount(precio_con_descuento).to_f * cantidad

          {
            product_id: product.id,
            nombre_producto: product.nombre_producto,
            cantidad: cantidad,
            precio_producto: product.precio_producto,
            stock: product.stock,
            slug: product.slug,
            imagen_url: product.imagen.attached? ? url_for(product.imagen) : nil,
            precio_con_mejor_descuento: precio_con_descuento,
            mejor_descuento_para_precio: mejor_descuento,
            precio_con_descuento: precio_con_descuento,
            precio_con_iva: product.precio_con_iva(precio_con_descuento).to_f,
            tiene_descuento: mejor_descuento.present? && precio_con_descuento < product.precio_producto,
            porcentaje_descuento: if mejor_descuento.present?
              ((product.precio_producto - precio_con_descuento) / product.precio_producto * 100).round
            else
              0
            end,
            subtotal_line: subtotal_line,
            iva_line: iva_line
          }
        end

        subtotal_sin_iva = products.sum { |p| p[:subtotal_line].to_f }
        iva_total = products.sum { |p| p[:iva_line].to_f }
        envio = 10_000
        total = subtotal_sin_iva + iva_total + envio

        {
          id: cart.id,
          products: products,
          subtotal_sin_iva: subtotal_sin_iva,
          iva_total: iva_total,
          envio: envio,
          total: total
        }
      end
    end
  end
end