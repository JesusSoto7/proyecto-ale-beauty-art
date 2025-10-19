class Api::V1::DiscountsController < Api::V1::BaseController
  before_action :set_discount, only: [:show, :update, :destroy]

  def index
    @discounts = Discount.all
    render json: @discounts
  end

  def show
    render json: @discount
  end

  def create
    @discount = Discount.new(discount_params)
    if @discount.save
      render json: @discount, status: :created
    else
      render json: { errors: @discount.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @discount.update(discount_params)
      render json: @discount, status: :ok
    else
      render json: { errors: @discount.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @discount.destroy
      render json: { message: "Descuento eliminado correctamente." }, status: :ok
    else
      render json: { error: "No se pudo eliminar el descuento." }, status: :unprocessable_entity
    end
  end

  private

  def set_discount
    @discount = Discount.find(params[:id])
  end

  def discount_params
    params.require(:discount).permit(:nombre, :descripcion, :tipo, :valor, :fecha_inicio, :fecha_fin, :activo)
  end
end