class Api::V1::PaymentMethodsController < Api::V1::BaseController
  def index
    methods = PaymentMethod.where(activo: true).order(:nombre_metodo)
    render json: methods.as_json(only: [:id, :nombre_metodo, :codigo])
  end
end