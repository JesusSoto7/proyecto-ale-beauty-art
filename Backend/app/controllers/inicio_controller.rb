class InicioController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :all_products]
  layout "inicio"
  def index
    @product = Product.all
    @admin = User.with_role(:admin).first
  end

  def all_products
    @products = Product.all
  end
end
