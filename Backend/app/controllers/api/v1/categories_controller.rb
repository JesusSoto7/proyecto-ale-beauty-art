class Api::V1::CategoriesController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_category, only: [:show]

  skip_before_action :authorize_request, only: [:index, :show]

  def index
    categories = Category.with_attached_imagen.all
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
