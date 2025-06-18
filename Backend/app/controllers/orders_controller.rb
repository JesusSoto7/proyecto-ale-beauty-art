class OrdersController < ApplicationController

  def create
    order = Order.create(
      user: current_user,
      status: :pendiente
    )

    session[:order_id] = order.id
    redirect_to new_checkouts_path
  end

end
