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
    cantidad = 1 if cantidad <= 0
    @cart.agregar_producto(product_id, cantidad)

    respond_to do |format|
      format.html { redirect_to current_cart_path, notice: "Producto agregado" }
      format.turbo_stream
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
