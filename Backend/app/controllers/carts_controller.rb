class CartsController < ApplicationController
  before_action :initialize_cart
  layout "inicio"
  def show_current
    @cart = current_cart
  end

  def add
    @cart = current_user&.cart || Cart.create(user: current_user)
    product_id = params[:product_id]
    cantidad = params[:cantidad].to_i

    if cantidad != 0
      @cart.agregar_producto(product_id, cantidad)
    end

    item = @cart.cart_products.find_by(product_id: product_id)
    subtotal = item.cantidad * item.product.precio_producto
    total = @cart.cart_products.joins(:product).sum("products.precio_producto * cart_products.cantidad")

    respond_to do |format|
      format.json do
        render json: {
          cantidad: item&.cantidad || 0,
          subtotal: subtotal,
          total: total,
          total_items: @cart.cart_products.sum(:cantidad)
        }
      end

      format.html do
        redirect_to current_cart_path
      end
    end
  end

  def count
    cart = current_user&.cart || Cart.find_by(id: session[:cart_id]) || Cart.create
    total = cart.cart_products.sum(:cantidad)

    render json: { count: total }
  end

  def initialize_cart
    @cart = current_user&.cart || Cart.create(user: current_user)
  end

end
