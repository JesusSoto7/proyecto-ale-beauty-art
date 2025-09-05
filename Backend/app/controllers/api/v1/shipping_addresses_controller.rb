class Api::V1::ShippingAddressesController < Api::V1::BaseController
  before_action :set_shipping_address, only: [:update, :destroy, :set_predeterminada, :show]

  def index
    shipping_addresses = current_user.shipping_addresses.includes(neighborhood: { municipality: :department })
    render json: shipping_addresses.as_json(include: {
      neighborhood: {
        include: {
          municipality: { include: :department }
        }
      }
    }), status: :ok
  end

  def show
    render json: @shipping_address.as_json(include: {
      neighborhood: {
        include: {
          municipality: { include: :department }
        }
      }
    }), status: :ok
  end


  def create
    shipping_address = current_user.shipping_addresses.new(shipping_address_params)
    if shipping_address.save
      render json: shipping_address.as_json(include: {
        neighborhood: {
          include: {
            municipality: { include: :department }
          }
        }
      }), status: :created
    else
      render json: { errors: shipping_address.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @shipping_address.update(shipping_address_params)
      render json: @shipping_address.as_json(include: {
        neighborhood: {
          include: {
            municipality: { include: :department }
          }
        }
      }), status: :ok
    else
      render json: { errors: @shipping_address.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @shipping_address.orders.exists?
      render json: { error: "No puedes eliminar una dirección que ya fue usada en una orden." }, status: :unprocessable_entity
    else
      @shipping_address.destroy!
      render json: { message: "Dirección eliminada correctamente." }, status: :ok
    end
  end

  def predeterminada
    address = current_user.shipping_addresses.find_by(predeterminada: true)
    if address
      render json: address.as_json(include: {
        neighborhood: {
          include: {
            municipality: { include: :department }
          }
        }
      }), status: :ok
    else
      render json: { error: "No tienes dirección predeterminada" }, status: :not_found  
    end
  end

  def set_predeterminada
    current_user.shipping_addresses.update_all(predeterminada: false)
    @shipping_address.update(predeterminada: true)

    if session[:order_id].present?
      order = Order.find_by(id: session[:order_id])
      order.update(shipping_address: @shipping_address) if order&.status == 0
    end

    render json: { success: true, message: "Dirección predeterminada actualizada." }, status: :ok
  end

  private

  def set_shipping_address
    @shipping_address = current_user.shipping_addresses.find(params[:id])
  end

  def shipping_address_params
    params.require(:shipping_address).permit(
      :nombre, :apellido, :telefono, :direccion,
      :neighborhood_id, :codigo_postal,
      :indicaciones_adicionales, :predeterminada
    )
  end
end
