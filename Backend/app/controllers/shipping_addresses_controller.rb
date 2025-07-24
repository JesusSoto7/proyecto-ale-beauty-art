class ShippingAddressesController < ApplicationController
  layout 'inicio'
  before_action :authenticate_user!
  before_action :set_shipping_address, only: [:edit, :update, :destroy, :set_predeterminada]

  def index
    @shipping_addresses = current_user.shipping_addresses
    @shipping_address = ShippingAddress.new
    @departments = Department.all
  end

  def new
    @shipping_address = ShippingAddress.new
    @departments = Department.all
  end

  def edit
    @departments = Department.all

    neighborhood = @shipping_address.neighborhood
    municipality = neighborhood&.municipality
    department = municipality&.department

    @selected_department_id = department&.id
    @selected_municipality_id = municipality&.id
    @selected_neighborhood_id = neighborhood&.id

    @municipalities = @selected_department_id ? Municipality.where(department_id: @selected_department_id) : []
    @neighborhoods = @selected_municipality_id ? Neighborhood.where(municipality_id: @selected_municipality_id) : []
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
      render :index, status: :unprocessable_entity
    end
  end

  def update
    
    if @shipping_address.update(shipping_address_params)
      redirect_to direcciones_path, notice: "Dirección actualizada exitosamente."
    else
      @departments = Department.all
      @selected_department_id = @shipping_address.neighborhood&.municipality&.department_id
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
      order.update(shipping_address: @shipping_address) if order&.status == 0
    end

    respond_to do |format|
      format.html do
        redirect_path = params[:from_checkout] ? seleccionar_direccion_checkouts_path : direcciones_path
        redirect_to redirect_path, notice: "Dirección predeterminada actualizada."
      end
      format.json { render json: { success: true } }
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
