class CheckoutsController < ApplicationController
  layout 'checkout'

  def new
     @shipping_address = ShippingAddress.new
  end

  def create_address
    @shipping_address = ShippingAddress.new(shipping_address_params)
    @shipping_address.user = current_user if current_user.present?
    @shipping_address.order = current_order

    if @shipping_address.save
      redirect_to checkout_path(current_order.id)
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @order = Order.find(params[:id])
    @shipping_address = @order.shipping_address || current_user&.shipping_addresses&.last
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
