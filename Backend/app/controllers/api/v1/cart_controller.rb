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
        {
          id: cart.id,
          products: cart.cart_products.includes(product: [:discount]).map do |cp|
            product = cp.product
            mejor_descuento = product.mejor_descuento_para_precio(product.precio_producto)
            precio_con_descuento = product.precio_con_mejor_descuento(product.precio_producto)
            {
              product_id: product.id,
              nombre_producto: product.nombre_producto,
              cantidad: cp.cantidad,
              precio_producto: product.precio_producto,
              stock: product.stock,
              imagen_url: product.imagen.attached? ? url_for(product.imagen) : nil,
              precio_con_mejor_descuento: precio_con_descuento,
              mejor_descuento_para_precio: mejor_descuento,
              precio_con_descuento: precio_con_descuento,
              tiene_descuento: mejor_descuento.present? && precio_con_descuento < product.precio_producto,
              porcentaje_descuento: if mejor_descuento.present?
                ((product.precio_producto - precio_con_descuento) / product.precio_producto * 100).round
              else
                0
              end
            }
          end
        }
      end
    end
  end
end