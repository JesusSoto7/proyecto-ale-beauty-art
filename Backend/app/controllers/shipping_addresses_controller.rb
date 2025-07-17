class ShippingAddressesController < ApplicationController
  layout 'inicio'
  before_action :authenticate_user!
  before_action :set_shipping_address, only: [:edit, :update, :destroy, :set_predeterminada]

  def index
    @shipping_addresses = current_user.shipping_addresses
    @shipping_address = ShippingAddress.new
    @departments = Department.all
    @municipalities = if params.dig(:shipping_address, :department_id).present?
                        Municipality.where(department_id: params[:shipping_address][:department_id])
                      else
                        []
                      end

    @neighborhoods = if params.dig(:shipping_address, :municipality_id).present?
                      Neighborhood.where(municipality_id: params[:shipping_address][:municipality_id])
                    else
                      []
                   end
  end

  def new
    @shipping_address = ShippingAddress.new
    @departments = Department.all
    @municipalities = params[:department_id].present? ? Municipality.where(department_id: params[:department_id]) : []
    @neighborhoods = params[:municipality_id].present? ? Neighborhood.where(municipality_id: params[:municipality_id]) : []
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
      @departments = Department.all
      @municipalities = Municipality.where(department_id: params[:shipping_address][:department_id])
      @neighborhoods = Neighborhood.where(municipality_id: params[:shipping_address][:municipality_id])
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
    if @shipping_address.orders.exists?
      redirect_to direcciones_path, alert: "No puedes eliminar una dirección que ya fue usada en una orden."
    else
      @shipping_address.destroy!
      redirect_to direcciones_path, notice: "Dirección eliminada correctamente."
    end
  end


  def set_predeterminada

    current_user.shipping_addresses.update_all(predeterminada: false)

    @shipping_address.update(predeterminada: true)

    if session[:order_id].present?
      order = Order.find_by(id: session[:order_id])

      if order&.status == 0
        order.update(shipping_address: @shipping_address)
      end
    end

    if params[:from_checkout].present?
      redirect_to seleccionar_direccion_checkouts_path
    else
      redirect_to direcciones_path, notice: "Dirección predeterminada actualizada."
    end
  end


  private

  def set_shipping_address
    @shipping_address = current_user.shipping_addresses.find(params[:id])
  end

  def shipping_address_params
    params.require(:shipping_address).permit(
      :nombre, :apellido, :telefono, :direccion,
      :neighborhood_id,
      :codigo_postal, :indicaciones_adicionales, :predeterminada
    )
  end


end
