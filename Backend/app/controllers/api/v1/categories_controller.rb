class Api::V1::CategoriesController < ActionController::API
  include Rails.application.routes.url_helpers # pa usar `url_for`

  before_action :set_category, only: [:show]

  def index
    # Precargar imágenes y categorías para evitar N+1 queries
    categories = Category.with_attached_imagen.all
    categories = Category.all
    render json: categories.as_json(
      only: [:id, :nombre_categoria],
      methods: [:imagen_url]
    ), status: :ok
  end

  def show
    render json: @category.as_json(
      only: [:id, :nombre_categoria],
      methods: [:imagen_url]
    ), status: :ok
  end

  private

  def set_category
    @category = Category.find_by(id: params[:id])
    unless @category
      render json: { error: "Categoría no encontrada" }, status: :not_found
    end
  end
end

