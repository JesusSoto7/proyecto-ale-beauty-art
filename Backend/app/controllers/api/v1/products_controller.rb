class Api::V1::ProductsController < Api::V1::BaseController
  before_action :set_product, only: [:show]

  def index
    # Precargar imágenes y categorías para evitar N+1 queries
    products = Product.with_attached_imagen.includes(:category).all
    products = Product.includes(:category).all
    render json: products.as_json(
      include: {
        category: { only: [:nombre_categoria] }
      },
      methods: [:imagen_url]
    ), status: :ok
  end

  def show
    render json: @product.as_json(
      include: {
        category: { only: [:nombre_categoria] }
      },
      methods: [:imagen_url]
    ), status: :ok
  end

  private

  def set_product
    @product = Product.includes(:category).find_by(id: params[:id])
    unless @product
      render json: { error: "Producto no encontrado" }, status: :not_found
    end
  end
end

