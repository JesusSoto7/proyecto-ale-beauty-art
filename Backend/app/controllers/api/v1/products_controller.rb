class Api::V1::ProductsController < ApplicationController
  skip_before_action :authenticate_user!
  before_action :set_product, only: [:show]

  def index
    products = Product.all
    render json: products
  end

  def show
    render json: @product
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(:nombre_producto, :precio_producto, :descripcion, :category_id, :stock, :imagen)
  end
end
