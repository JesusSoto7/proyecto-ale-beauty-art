module Api
  module V1
      class CartController < BaseController
      before_action :authorize_request
      def show
        cart = current_user&.cart

        if cart
          render json: {
            mensaje: "Carrito cargado correctamente",
            carrito: cart.cart_products.includes(:product).map do |cart_product|
              {
                id: cart_product.id,
                product_id: cart_product.product.id,
                nombre_producto: cart_product.product.nombre_producto,
                precio_producto: cart_product.product.precio_producto,
                descripcion: cart_product.product.descripcion,
                cantidad: cart_product.cantidad,
                subtotal: cart_product.product.precio_producto * cart_product.cantidad
              }
            end
          }, status: :ok
        else
          render json: { mensaje: "El usuario no tiene un carrito aún" }, status: :ok
        end
      end


      def add_product
        cart = current_user.cart || Cart.create(user: current_user)
        product = Product.find_by(id: params[:product_id])
        cantidad = params[:cantidad].to_i

        if product.nil?
          render json: { error: "Producto no encontrado" }, status: :not_found
          return
        end

        cart_product = cart.cart_products.find_or_initialize_by(product_id: product.id)
        cart_product.cantidad = cart_product.cantidad.to_i + cantidad

        if cart_product.save
          carrito = cart.cart_products.includes(:product).map do |item|
            {
              id: item.id,
              product_id: item.product.id,
              nombre_producto: item.product.nombre_producto,
              precio_producto: item.product.precio_producto,
              descripcion: item.product.descripcion,
              cantidad: item.cantidad,
              subtotal: item.cantidad * item.product.precio_producto
            }
          end

          render json: {
            mensaje: "Producto agregado correctamente",
            carrito: carrito
          }, status: :ok
        else
          render json: { error: "No se pudo agregar el producto" }, status: :unprocessable_entity
        end
      end

      def remove_product
        cart = current_user&.cart

        if cart
          cart_product = cart.cart_products.find_by(product_id: params[:product_id])

          if cart_product
            cart_product.destroy
            render json: { mensaje: "Producto eliminado del carrito" }, status: :ok
          else
            render json: { error: "Producto no encontrado en el carrito" }, status: :not_found
          end
        else
          render json: { error: "El usuario no tiene un carrito" }, status: :not_found
        end
      end
    end
  end
end
