class CartsController < ApplicationController
  before_action :initialize_cart
  layout "inicio"
  def show_current
  end

  def add
    @cart = current_user&.cart || Cart.create(user: current_user)
    product_id = params[:product_id]
    cantidad = params[:cantidad].to_i
    cantidad = 1 if cantidad <= 0
    @cart.agregar_producto(product_id, cantidad)

    redirect_to current_cart_path
  end

  def count
  end

  def initialize_cart
    @cart = current_user&.cart || Cart.create(user: current_user)
  end
end
