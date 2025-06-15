class CheckoutsController < ApplicationController
  layout 'checkout'

  def start_checkout
    order = Order.create(
      user: current_user,
      status: :pendiente
    )

    session[:order_id] = order.id
    redirect_to new_checkouts_path
  end

  def new
     @shipping_address = ShippingAddress.new
  end

  def create_address
    @shipping_address = ShippingAddress.new(shipping_address_params)
    @shipping_address.user = current_user if current_user.present?
    @shipping_address.order = current_order

    if @shipping_address.save
      redirect_to new_checkouts_path, notice: "Dirección creada con éxito"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def shipping_address_params
    params.require(:shipping_address).permit(
      :nombre, :apellido, :telefono, :direccion,
      :municipio, :barrio, :apartamento,
      :codigo_postal, :indicaciones_adicionales, :predeterminada
    )
  end
end
