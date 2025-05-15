class InicioController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :allProducts]
  layout "inicio"
  def index
    @product = Product.all
  end

  def allProducts
    @products = Product.all
  end
end
