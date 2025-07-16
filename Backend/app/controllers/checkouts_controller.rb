class CheckoutsController < ApplicationController
  layout 'checkout'
  skip_before_action :authenticate_user!, only: [:success]

  def direccion_envio
    @order = Order.find(session[:order_id])
    @shipping_addresses = current_user&.shipping_addresses || []
    @shipping_address = @order.shipping_address.presence ||
                    current_user&.shipping_addresses&.find_by(predeterminada: true) ||
                    current_user&.shipping_addresses&.last ||
                    ShippingAddress.new

  end

  def edit_direccion
    @shipping_address = current_user.shipping_addresses.find(params[:id])
  end

  def editar_direccion
    @shipping_address = current_user.shipping_addresses.find(params[:id])

    if @shipping_address.update(shipping_address_params)
      redirect_to seleccionar_direccion_checkouts_path
    else
      render :edit_direccion
    end
  end


  def create_address
    @shipping_address = ShippingAddress.new(shipping_address_params)
    @shipping_address.user = current_user if current_user.present?

    if @shipping_address.save
      current_order.update(shipping_address: @shipping_address)
      redirect_to checkout_path(current_cart.id)
    else
      render :new, status: :unprocessable_entity
    end
  end

  def seleccionar_direccion
    @order = Order.find(session[:order_id])
    @shipping_addresses = current_user.shipping_addresses
  end

  def show
    @order = Order.find_by(id: params[:id])
    if @order.nil?
      redirect_to root_path, alert: "Orden no encontrada."
      return
    end
    @shipping_address = @order.shipping_address || current_user&.shipping_addresses&.last
  end

  def success
    @order = Order.find(params[:id])
    @payment_id = params[:payment_id]
    if @order.nil?
      redirect_to inicio_path, alert: "Orden no encontrada."
      return
    end

    @shipping_address = @order.shipping_address || current_user&.shipping_addresses&.last

    if current_user&.cart.present?
      current_user.cart.cart_products.destroy_all
      puts "Carrito borrado tras pago exitoso"
    end

    render :success
  end

  def rejected
    @order = Order.find(params[:id])
    @payment_id = params[:payment_id]
    if @order.nil?
      redirect_to inicio_path, alert: "Orden no encontrada."
      return
    end

    render :rejected

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
