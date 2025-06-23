class Api::V1::ProductsController < ApplicationController
  skip_before_action :authenticate_user!
  before_action :set_product, only: [:show]

  def index
    products = Product.includes(:category).all
    render json: products.as_json(
      include: {
        category: { only: [:nombre_categoria]}
      },
      methods: [:imagen_url]
    )
  end

  def show
    render json: @product.as_json(
      include: {
        category: { only: [:nombre_categoria]}
      },
      methods: [:imagen_url]
    )
  end

  private

  def set_product
    @product = Product.includes(:category).find(params[:id])
  end

  def product_params
    params.require(:product).permit(:nombre_producto, :precio_producto, :descripcion, :category_id, :stock, :imagen)
  end
end
