class Api::V1::CategoriesController < ApplicationController
  skip_before_action :authenticate_user!
  before_action :set_category, only: [:show]

  def index
    categories = Category.all
    render json: categories
  end

  def show
    render json: @category
  end

  private

  def set_category
    @category = Category.find(params[:id])
  end

  def category_params
    params.require(:category).permit( :nombre_categoria, :imagen)
  end
end
