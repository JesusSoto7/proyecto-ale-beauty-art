class Api::V1::SubCategoriesController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_category
  before_action :set_sub_category, only: [:show, :update, :destroy]
  skip_before_action :authorize_request, only: [:index, :show]

  # GET /api/v1/categories/:category_slug/sub_categories
  def index
    subcategories = @category.sub_categories.with_attached_imagen
    render json: subcategories.as_json(
      only: [:id, :nombre],
      include: { category: { only: [:id, :nombre_categoria, :slug] } },
      methods: [:slug, :imagen_url]
    ), status: :ok
  end

  # GET /api/v1/categories/:category_slug/sub_categories/:id
  def show
    render json: @sub_category.as_json(
      only: [:id, :nombre],
      include: { category: { only: [:id, :nombre_categoria, :slug] } },
      methods: [:slug, :imagen_url]
    ), status: :ok
  end

  # POST /api/v1/categories/:category_slug/sub_categories
  def create
    subcategory = @category.sub_categories.new(sub_category_params)
    if subcategory.save
      render json: subcategory, status: :created
    else
      render json: { error: subcategory.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/categories/:category_slug/sub_categories/:id
  def update
    if @sub_category.update(sub_category_params)
      render json: @sub_category, status: :ok
    else
      render json: { error: @sub_category.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/categories/:category_slug/sub_categories/:id
  def destroy
    @sub_category.destroy
    render json: { message: "SubCategoría eliminada" }, status: :ok
  end

  private

  def set_category
    @category = Category.find_by(slug: params[:category_slug]) || Category.find_by(id: params[:category_slug])
    render json: { error: "Categoría no encontrada" }, status: :not_found unless @category
  end


  def set_sub_category
    @sub_category = @category.sub_categories.find_by(slug: params[:sub_category_slug]) ||
                    @category.sub_categories.find_by(id: params[:sub_category_slug])
    unless @sub_category
      render json: { error: "SubCategoría no encontrada" }, status: :not_found
    end
  end

  def sub_category_params
    params.require(:sub_category).permit(:nombre, :imagen)
  end
end
