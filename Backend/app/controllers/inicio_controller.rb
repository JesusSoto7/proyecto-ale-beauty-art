class InicioController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :all_products]
  layout "inicio"
  def index
    @product = Product.order("RAND()").limit(9)
    @admin = User.with_role(:admin).first
    @categories = Category.all
  end

  def all_products
    @products = Product.all
  end

  def showClient
    @product = Product.find_by(id: params[:id])

    unless @product
      redirect_to root_path, alert: "Producto no encontrado"
    end
  end
  
end
