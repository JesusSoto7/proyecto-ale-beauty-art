class InicioController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :all_products]
  layout "inicio"
  def index
    @product = Product.order("RAND()").limit(9)
    @admin = User.with_role(:admin).first
    @categories = Category.all
    @products = @products.where("nombre_producto LIKE ?", "%#{params[:name]}%") if params[:name].present?

  end

  def all_products
    @products = Product.all

    # Filtros por nombre
    @products = @products.where("nombre_producto LIKE ?", "%#{params[:name]}%") if params[:name].present?

    # Filtros por precio (mínimo y máximo)
    @products = @products.where("precio_producto >= ?", params[:min_price]) if params[:min_price].present?
    @products = @products.where("precio_producto <= ?", params[:max_price]) if params[:max_price].present?

    # Filtros por categoría
    @products = @products.where(category: params[:category]) if params[:category].present?
  end

  def showClient
    @product = Product.find_by(id: params[:id])

    unless @product
      redirect_to root_path, alert: "Producto no encontrado"
    end
    @products = @products.where("nombre_producto LIKE ?", "%#{params[:name]}%") if params[:name].present?
  end
  
end
