class ShippingAddressesController < ApplicationController
  layout 'inicio'
  before_action :authenticate_user!
  before_action :set_shipping_address, only: [:edit, :update, :destroy]

  def index
    @shipping_addresses = current_user.shipping_addresses
    @shipping_address = ShippingAddress.new
  end

  def new
    @shipping_address = ShippingAddress.new
  end

  def edit
  end

  def show
  end

  def create
    @shipping_address = ShippingAddress.new(shipping_address_params)
    @shipping_address.user = current_user if current_user.present?

    if @shipping_address.save
      redirect_to direcciones_path
    else
      @shipping_addresses = current_user.shipping_addresses
      render :index, status: :unprocessable_entity
    end
  end

  def update
    if @shipping_address.update(shipping_address_params)
      redirect_to direcciones_path, notice: "Dirección actualizada exitosamente."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @shipping_address.destroy!
    redirect_to direcciones_path, notice: "Dirección eliminada correctamente."
  end

  private

  def set_shipping_address
    @shipping_address = current_user.shipping_addresses.find(params[:id])
  end

  def shipping_address_params
    params.require(:shipping_address).permit(
      :nombre, :apellido, :telefono, :direccion,
      :municipio, :barrio, :apartamento,
      :codigo_postal, :indicaciones_adicionales, :predeterminada
    )
  end
end
