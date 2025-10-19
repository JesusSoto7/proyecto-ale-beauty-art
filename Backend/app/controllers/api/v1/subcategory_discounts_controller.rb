class Api::V1::SubcategoryDiscountsController < Api::V1::BaseController
  before_action :set_subcategory_discount, only: [:show, :destroy]

  def index
    @subcategory_discounts = SubcategoryDiscount.all
    render json: @subcategory_discounts
  end

  def show
    render json: @subcategory_discount
  end

  def create
    @subcategory_discount = SubcategoryDiscount.new(subcategory_discount_params)
    if @subcategory_discount.save
      render json: @subcategory_discount, status: :created
    else
      render json: { errors: @subcategory_discount.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @subcategory_discount.destroy
      render json: { message: "Asignación eliminada." }, status: :ok
    else
      render json: { error: "No se pudo eliminar la asignación." }, status: :unprocessable_entity
    end
  end

  private

  def set_subcategory_discount
    @subcategory_discount = SubcategoryDiscount.find(params[:id])
  end

  def subcategory_discount_params
    params.require(:subcategory_discount).permit(:sub_category_id, :discount_id)
  end
end