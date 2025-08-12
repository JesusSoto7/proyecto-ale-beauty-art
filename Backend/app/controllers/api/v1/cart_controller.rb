module Api
  module V1
    class CartController < BaseController
      before_action :authorize_request

      def show
        cart = current_user.cart || current_user.create_cart
        render json: cart_json(cart)
      end

      def add_product
        cart = current_user.cart || current_user.create_cart
        product = Product.find(params[:product_id])

        cart_product = cart.cart_products.find_or_initialize_by(product: product)
        cart_product.cantidad ||= 0
        cart_product.cantidad += 1

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
          products: cart.cart_products.includes(:product).map do |cp|
            {
              product_id: cp.product.id,
              nombre_producto: cp.product.nombre_producto,
              cantidad: cp.cantidad,
              precio_producto: cp.product.precio_producto,
              imagen_url: cp.product.imagen.attached? ? url_for(cp.product.imagen) : nil
            }
          end
        }
      end
    end
  end
end
