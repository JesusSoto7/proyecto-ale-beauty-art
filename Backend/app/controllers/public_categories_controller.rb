class PublicCategoriesController < ApplicationController
  skip_before_action :authenticate_user!
  def index
    @categories = Category.all
     render layout: "inicio"
  end

  def show
    @category = Category.find(params[:id])
    @products = @category.products
    render layout: "all_products", template: "public_categories/show"
  end
end
